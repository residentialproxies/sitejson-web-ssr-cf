#!/usr/bin/env bash
set -euo pipefail

# SiteJSON Web SSR rollback script.
# Strategy: redeploy previously archived build output created by scripts/deploy.sh.
#
# Usage:
#   ./scripts/rollback.sh [staging|production] [--release-id <id>] [--list] [--yes] [--skip-verify]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEPLOY_ROOT="${PROJECT_ROOT}/.deploy"
RELEASE_DIR="${DEPLOY_ROOT}/releases"
MANIFEST_DIR="${DEPLOY_ROOT}/manifests"
LOG_DIR="${DEPLOY_ROOT}/logs"
ROLLBACK_TMP_DIR=""

ENVIRONMENT="staging"
RELEASE_ID=""
LIST_ONLY=0
FORCE=0
SKIP_VERIFY=0
PROJECT_NAME=""
DEPLOY_BRANCH=""
SITE_URL=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup_tmp_dir() {
  if [[ -n "${ROLLBACK_TMP_DIR:-}" && -d "${ROLLBACK_TMP_DIR}" ]]; then
    rm -rf "${ROLLBACK_TMP_DIR}"
  fi
}

usage() {
  cat <<'EOF'
Usage: ./scripts/rollback.sh [staging|production] [options]

Options:
  --release-id <id>   Roll back to a specific local release id.
  --project-name <n>  Override Cloudflare Pages project name.
  --branch <name>     Override deploy branch.
  --site-url <url>    Override smoke-check URL.
  --list              List available local releases and exit.
  --skip-verify       Skip post-rollback smoke checks.
  --yes               Non-interactive confirmation.
  -h, --help          Show help.

Notes:
  - This script requires release archives under .deploy/releases.
  - If --release-id is omitted, it selects the previous release (2nd latest).
EOF
}

error_exit() {
  log_error "$1"
  exit 1
}

require_command() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || error_exit "Required command not found: $cmd"
}

default_project() {
  if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "${SITEJSON_PAGES_PROJECT_PRODUCTION:-sitejson-web-ssr}"
  else
    echo "${SITEJSON_PAGES_PROJECT_STAGING:-sitejson-web-ssr}"
  fi
}

default_branch() {
  if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "${SITEJSON_PAGES_BRANCH_PRODUCTION:-main}"
  else
    echo "${SITEJSON_PAGES_BRANCH_STAGING:-staging}"
  fi
}

default_site_url() {
  if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "${SITEJSON_PRODUCTION_URL:-https://sitejson.com}"
  else
    echo "${SITEJSON_STAGING_URL:-}"
  fi
}

cloudflare_environment() {
  if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "production"
  else
    echo "preview"
  fi
}

list_local_releases() {
  local files
  files="$(ls -1t "${RELEASE_DIR}"/*-"${ENVIRONMENT}".tar.gz 2>/dev/null || true)"
  if [[ -z "$files" ]]; then
    echo "No local releases found for ${ENVIRONMENT}."
    return 0
  fi

  echo "Available local releases (${ENVIRONMENT}):"
  printf '%s\n' "$files" | while read -r file; do
    local base id
    base="$(basename "$file")"
    id="${base%-${ENVIRONMENT}.tar.gz}"
    echo "  - ${id}"
  done
}

select_target_release() {
  if [[ -n "$RELEASE_ID" ]]; then
    TARGET_RELEASE_FILE="${RELEASE_DIR}/${RELEASE_ID}-${ENVIRONMENT}.tar.gz"
    [[ -f "$TARGET_RELEASE_FILE" ]] || error_exit "Release not found: ${RELEASE_ID} (${TARGET_RELEASE_FILE})"
    TARGET_RELEASE_ID="$RELEASE_ID"
    return 0
  fi

  local files
  files="$(ls -1t "${RELEASE_DIR}"/*-"${ENVIRONMENT}".tar.gz 2>/dev/null || true)"
  [[ -n "$files" ]] || error_exit "No local release archives found for '${ENVIRONMENT}'."

  TARGET_RELEASE_FILE="$(printf '%s\n' "$files" | sed -n '2p')"
  if [[ -z "$TARGET_RELEASE_FILE" ]]; then
    TARGET_RELEASE_FILE="$(printf '%s\n' "$files" | sed -n '1p')"
    log_warn "Only one release exists; rolling back by redeploying latest local release."
  fi

  local base
  base="$(basename "$TARGET_RELEASE_FILE")"
  TARGET_RELEASE_ID="${base%-${ENVIRONMENT}.tar.gz}"
}

confirm_rollback() {
  if [[ "$FORCE" -eq 1 ]]; then
    return 0
  fi

  log_warn "Rollback target"
  log_warn "  Environment: ${ENVIRONMENT}"
  log_warn "  Project: ${PROJECT_NAME}"
  log_warn "  Branch: ${DEPLOY_BRANCH}"
  log_warn "  Release ID: ${TARGET_RELEASE_ID}"
  read -r -p "Type 'rollback' to continue: " confirmation
  [[ "$confirmation" == "rollback" ]] || error_exit "Rollback cancelled."
}

smoke_check_url() {
  local url="$1"
  local max_attempts=6
  local attempt=1
  while [[ "$attempt" -le "$max_attempts" ]]; do
    if curl -fsS --max-time 20 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 5
    attempt=$((attempt + 1))
  done
  return 1
}

run_smoke_checks() {
  if [[ "$SKIP_VERIFY" -eq 1 ]]; then
    log_warn "Skipping post-rollback checks (--skip-verify)."
    return 0
  fi

  local verify_url="$SITE_URL"
  if [[ -z "$verify_url" && -n "${DEPLOYMENT_URL:-}" ]]; then
    verify_url="$DEPLOYMENT_URL"
  fi

  if [[ -z "$verify_url" ]]; then
    log_warn "No verify URL configured; skipping smoke checks."
    return 0
  fi

  local targets=(
    "$verify_url/"
    "$verify_url/robots.txt"
    "$verify_url/sitemap.xml"
  )

  local target
  for target in "${targets[@]}"; do
    if smoke_check_url "$target"; then
      log_success "Rollback check passed: ${target}"
    else
      error_exit "Rollback check failed: ${target}"
    fi
  done
}

select_latest_deployment() {
  local cf_env
  cf_env="$(cloudflare_environment)"
  local deployments_json
  deployments_json="$(cd "$PROJECT_ROOT" && npx wrangler pages deployment list \
    --project-name "$PROJECT_NAME" \
    --environment "$cf_env" \
    --json 2>/dev/null || true)"

  if [[ -z "$deployments_json" ]]; then
    DEPLOYMENT_ID=""
    DEPLOYMENT_URL=""
    return 0
  fi

  DEPLOYMENT_ID="$(printf '%s' "$deployments_json" | node -e '
const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();
if (!input) process.exit(0);
let data;
try { data = JSON.parse(input); } catch { process.exit(0); }
const first = Array.isArray(data) && data.length ? data[0] : null;
if (!first) process.exit(0);
const id = first.id || first.Id || "";
if (id) process.stdout.write(String(id));
')"

  DEPLOYMENT_URL="$(printf '%s' "$deployments_json" | node -e '
const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();
if (!input) process.exit(0);
let data;
try { data = JSON.parse(input); } catch { process.exit(0); }
const first = Array.isArray(data) && data.length ? data[0] : null;
if (!first) process.exit(0);
const direct = first.url || first.URL || first.deployment || first.Deployment || "";
if (direct) { process.stdout.write(String(direct)); process.exit(0); }
const aliases = Array.isArray(first.aliases)
  ? first.aliases
  : (Array.isArray(first.Aliases) ? first.Aliases : []);
if (!aliases.length) process.exit(0);
const firstAlias = aliases[0];
if (typeof firstAlias === "string") {
  process.stdout.write(firstAlias);
  process.exit(0);
}
if (firstAlias && typeof firstAlias === "object") {
  const aliasUrl = firstAlias.url || firstAlias.URL || "";
  if (aliasUrl) process.stdout.write(String(aliasUrl));
}
')"
}

write_manifest() {
  local manifest_path="$1"
  MANIFEST_PATH="$manifest_path" node <<'NODE'
const fs = require("fs");
const path = process.env.MANIFEST_PATH;
const data = {
  action: "rollback",
  environment: process.env.MANIFEST_ENVIRONMENT,
  timestamp_utc: process.env.MANIFEST_TIMESTAMP_UTC,
  target_release_id: process.env.MANIFEST_TARGET_RELEASE_ID,
  target_release_file: process.env.MANIFEST_TARGET_RELEASE_FILE,
  project_name: process.env.MANIFEST_PROJECT_NAME,
  deploy_branch: process.env.MANIFEST_DEPLOY_BRANCH,
  site_url: process.env.MANIFEST_SITE_URL,
  deploy_log: process.env.MANIFEST_DEPLOY_LOG,
  deployment_id: process.env.MANIFEST_DEPLOYMENT_ID,
  deployment_url: process.env.MANIFEST_DEPLOYMENT_URL
};
fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
NODE
}

preflight() {
  require_command node
  require_command npm
  require_command npx
  require_command tar
  require_command mktemp
  require_command curl

  [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] || error_exit "CLOUDFLARE_API_TOKEN is required."
  [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || error_exit "CLOUDFLARE_ACCOUNT_ID is required."
  [[ -d "$RELEASE_DIR" ]] || error_exit "Release directory not found: ${RELEASE_DIR}"

  mkdir -p "$MANIFEST_DIR" "$LOG_DIR"
}

rollback_deploy() {
  local rollback_ts
  rollback_ts="$(date -u +"%Y%m%dT%H%M%SZ")"
  local deploy_log="${LOG_DIR}/rollback-${rollback_ts}-${ENVIRONMENT}.log"
  local manifest_path="${MANIFEST_DIR}/rollback-${rollback_ts}-${ENVIRONMENT}.json"
  ROLLBACK_TMP_DIR="$(mktemp -d "${PROJECT_ROOT}/.deploy/tmp-rollback.XXXXXX")"
  tar -xzf "$TARGET_RELEASE_FILE" -C "$ROLLBACK_TMP_DIR"
  [[ -d "${ROLLBACK_TMP_DIR}/static" ]] || error_exit "Invalid release archive (missing static/): ${TARGET_RELEASE_FILE}"

  log_info "Redeploying release '${TARGET_RELEASE_ID}'..."
  (
    cd "$PROJECT_ROOT"
    npx wrangler pages deploy "${ROLLBACK_TMP_DIR}/static" \
      --project-name "$PROJECT_NAME" \
      --branch "$DEPLOY_BRANCH"
  ) 2>&1 | tee "$deploy_log"

  select_latest_deployment

  MANIFEST_ENVIRONMENT="$ENVIRONMENT" \
  MANIFEST_TIMESTAMP_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  MANIFEST_TARGET_RELEASE_ID="$TARGET_RELEASE_ID" \
  MANIFEST_TARGET_RELEASE_FILE="$TARGET_RELEASE_FILE" \
  MANIFEST_PROJECT_NAME="$PROJECT_NAME" \
  MANIFEST_DEPLOY_BRANCH="$DEPLOY_BRANCH" \
  MANIFEST_SITE_URL="${SITE_URL:-}" \
  MANIFEST_DEPLOY_LOG="$deploy_log" \
  MANIFEST_DEPLOYMENT_ID="${DEPLOYMENT_ID:-}" \
  MANIFEST_DEPLOYMENT_URL="${DEPLOYMENT_URL:-}" \
  write_manifest "$manifest_path"

  run_smoke_checks

  log_success "Rollback completed."
  log_info "Release used: ${TARGET_RELEASE_FILE}"
  log_info "Manifest: ${manifest_path}"
  if [[ -n "${DEPLOYMENT_ID:-}" ]]; then
    log_info "Deployment ID: ${DEPLOYMENT_ID}"
  fi
  if [[ -n "${DEPLOYMENT_URL:-}" ]]; then
    log_info "Deployment URL: ${DEPLOYMENT_URL}"
  fi
  log_info "To inspect runtime logs:"
  log_info "npx wrangler pages deployment tail --project-name ${PROJECT_NAME} --environment $(cloudflare_environment)"
}

main() {
  trap cleanup_tmp_dir EXIT

  if [[ "${1:-}" == "staging" || "${1:-}" == "production" ]]; then
    ENVIRONMENT="$1"
    shift
  fi

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --release-id)
        RELEASE_ID="${2:-}"
        [[ -n "$RELEASE_ID" ]] || error_exit "--release-id requires a value."
        shift 2
        ;;
      --project-name)
        PROJECT_NAME="${2:-}"
        [[ -n "$PROJECT_NAME" ]] || error_exit "--project-name requires a value."
        shift 2
        ;;
      --branch)
        DEPLOY_BRANCH="${2:-}"
        [[ -n "$DEPLOY_BRANCH" ]] || error_exit "--branch requires a value."
        shift 2
        ;;
      --site-url)
        SITE_URL="${2:-}"
        [[ -n "$SITE_URL" ]] || error_exit "--site-url requires a value."
        shift 2
        ;;
      --list)
        LIST_ONLY=1
        shift
        ;;
      --skip-verify)
        SKIP_VERIFY=1
        shift
        ;;
      --yes)
        FORCE=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        error_exit "Unknown option: $1"
        ;;
    esac
  done

  PROJECT_NAME="${PROJECT_NAME:-$(default_project)}"
  DEPLOY_BRANCH="${DEPLOY_BRANCH:-$(default_branch)}"
  SITE_URL="${SITE_URL:-$(default_site_url)}"

  if [[ "$LIST_ONLY" -eq 1 ]]; then
    if [[ ! -d "$RELEASE_DIR" ]]; then
      echo "No local release directory found at ${RELEASE_DIR}."
      exit 0
    fi
    list_local_releases
    exit 0
  fi

  preflight
  select_target_release
  confirm_rollback
  rollback_deploy
}

main "$@"
