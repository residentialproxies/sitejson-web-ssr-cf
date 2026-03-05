#!/usr/bin/env bash
set -euo pipefail

# SiteJSON Web SSR Cloudflare Pages deployment script.
# Usage:
#   ./scripts/deploy.sh [staging|production] [--skip-validate] [--skip-tests] [--skip-build] [--skip-smoke] [--yes]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEPLOY_ROOT="${PROJECT_ROOT}/.deploy"
RELEASE_DIR="${DEPLOY_ROOT}/releases"
MANIFEST_DIR="${DEPLOY_ROOT}/manifests"
LOG_DIR="${DEPLOY_ROOT}/logs"
KEEP_RELEASES="${KEEP_RELEASES:-20}"

ENVIRONMENT="staging"
PROJECT_NAME=""
DEPLOY_BRANCH=""
SITE_URL=""
SKIP_VALIDATE=0
SKIP_TESTS=0
SKIP_BUILD=0
SKIP_SMOKE=0
ALLOW_DIRTY=0
FORCE=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy.sh [staging|production] [options]

Options:
  --project-name <name>  Override Cloudflare Pages project name.
  --branch <name>        Override deploy branch.
  --site-url <url>       Override smoke-check base URL.
  --skip-validate        Skip ./scripts/validate.sh.
  --skip-tests           Skip test step during validate.
  --skip-build           Skip npm run build:cf.
  --skip-smoke           Skip post-deploy smoke checks.
  --allow-dirty          Allow deploy from a dirty git worktree.
  --yes                  Non-interactive production confirmation.
  -h, --help             Show this help.

Environment variable overrides:
  SITEJSON_PAGES_PROJECT_PRODUCTION (default: sitejson-web-ssr)
  SITEJSON_PAGES_PROJECT_STAGING    (default: sitejson-web-ssr)
  SITEJSON_PAGES_BRANCH_PRODUCTION  (default: main)
  SITEJSON_PAGES_BRANCH_STAGING     (default: staging)
  SITEJSON_PRODUCTION_URL           (default: https://sitejson.com)
  SITEJSON_STAGING_URL              (default: unset)
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

check_node_version() {
  local node_major
  node_major="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "$node_major" -lt 20 ]]; then
    error_exit "Node.js 20+ required. Found: $(node --version)"
  fi
}

confirm_production() {
  if [[ "$ENVIRONMENT" != "production" || "$FORCE" -eq 1 ]]; then
    return 0
  fi

  log_warn "Production deployment requested for project '${PROJECT_NAME}' (branch '${DEPLOY_BRANCH}')."
  read -r -p "Type 'production' to continue: " confirmation
  [[ "$confirmation" == "production" ]] || error_exit "Deployment cancelled."
}

check_git_state() {
  if [[ "$ALLOW_DIRTY" -eq 1 ]]; then
    return 0
  fi

  if ! command -v git >/dev/null 2>&1; then
    return 0
  fi

  if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return 0
  fi

  if [[ -n "$(git -C "$PROJECT_ROOT" status --porcelain)" ]]; then
    error_exit "Git worktree is dirty. Commit/stash changes or pass --allow-dirty."
  fi
}

preflight() {
  log_info "Running deploy preflight checks..."
  require_command node
  require_command npm
  require_command npx
  require_command curl
  require_command tar
  require_command mktemp
  check_node_version

  [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] || error_exit "CLOUDFLARE_API_TOKEN is required."
  [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || error_exit "CLOUDFLARE_ACCOUNT_ID is required."

  if ! (cd "$PROJECT_ROOT" && npx wrangler --version >/dev/null 2>&1); then
    error_exit "Wrangler is not available. Run 'npm ci' first."
  fi

  if ! (cd "$PROJECT_ROOT" && npx wrangler whoami >/dev/null 2>&1); then
    error_exit "Cloudflare authentication check failed (wrangler whoami)."
  fi

  check_git_state

  mkdir -p "$RELEASE_DIR" "$MANIFEST_DIR" "$LOG_DIR"
  log_success "Preflight checks passed."
}

run_validation() {
  if [[ "$SKIP_VALIDATE" -eq 1 ]]; then
    log_warn "Skipping validation (--skip-validate)."
    return 0
  fi

  local cmd=("${SCRIPT_DIR}/validate.sh" "--ci")
  if [[ "$SKIP_TESTS" -eq 1 ]]; then
    cmd+=("--skip-tests")
  fi
  if [[ "$SKIP_BUILD" -eq 1 ]]; then
    cmd+=("--skip-build")
  fi

  log_info "Running validation: ${cmd[*]}"
  (cd "$PROJECT_ROOT" && "${cmd[@]}")
}

build_output() {
  if [[ "$SKIP_BUILD" -eq 1 ]]; then
    log_warn "Skipping build step (--skip-build)."
  else
    log_info "Building Cloudflare output (npm run build:cf)..."
    (cd "$PROJECT_ROOT" && npm run build:cf)
  fi

  [[ -d "${PROJECT_ROOT}/.vercel/output/static" ]] || error_exit "Build output missing: .vercel/output/static"
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
  if [[ "$SKIP_SMOKE" -eq 1 ]]; then
    log_warn "Skipping smoke checks (--skip-smoke)."
    return 0
  fi

  local base_url="$SITE_URL"
  if [[ -z "$base_url" && -n "${DEPLOYMENT_URL:-}" ]]; then
    base_url="$DEPLOYMENT_URL"
  fi

  if [[ -z "$base_url" ]]; then
    log_warn "No smoke-check URL configured. Set --site-url or SITEJSON_STAGING_URL."
    return 0
  fi

  local targets=(
    "$base_url/"
    "$base_url/robots.txt"
    "$base_url/sitemap.xml"
  )

  log_info "Running smoke checks against ${base_url}..."
  local target
  for target in "${targets[@]}"; do
    if smoke_check_url "$target"; then
      log_success "Smoke check passed: ${target}"
    else
      error_exit "Smoke check failed: ${target}"
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

cleanup_old_releases() {
  local count
  count="$(ls -1t "${RELEASE_DIR}"/*-"${ENVIRONMENT}".tar.gz 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "$count" -le "$KEEP_RELEASES" ]]; then
    return 0
  fi

  ls -1t "${RELEASE_DIR}"/*-"${ENVIRONMENT}".tar.gz | tail -n "+$((KEEP_RELEASES + 1))" | while read -r old_file; do
    rm -f "$old_file"
  done
}

write_manifest() {
  local manifest_path="$1"
  MANIFEST_PATH="$manifest_path" node <<'NODE'
const fs = require("fs");
const path = process.env.MANIFEST_PATH;
const data = {
  environment: process.env.MANIFEST_ENVIRONMENT,
  timestamp_utc: process.env.MANIFEST_TIMESTAMP_UTC,
  release_id: process.env.MANIFEST_RELEASE_ID,
  project_name: process.env.MANIFEST_PROJECT_NAME,
  deploy_branch: process.env.MANIFEST_DEPLOY_BRANCH,
  site_url: process.env.MANIFEST_SITE_URL,
  release_archive: process.env.MANIFEST_RELEASE_ARCHIVE,
  deploy_log: process.env.MANIFEST_DEPLOY_LOG,
  deployment_id: process.env.MANIFEST_DEPLOYMENT_ID,
  deployment_url: process.env.MANIFEST_DEPLOYMENT_URL,
  git_commit: process.env.MANIFEST_GIT_COMMIT
};
fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
NODE
}

deploy() {
  local release_id
  release_id="$(date -u +"%Y%m%dT%H%M%SZ")"
  local release_archive="${RELEASE_DIR}/${release_id}-${ENVIRONMENT}.tar.gz"
  local deploy_log="${LOG_DIR}/deploy-${release_id}-${ENVIRONMENT}.log"
  local manifest_path="${MANIFEST_DIR}/${release_id}-${ENVIRONMENT}.json"
  local latest_manifest="${MANIFEST_DIR}/latest-${ENVIRONMENT}.json"

  log_info "Creating release archive: ${release_archive}"
  tar -czf "$release_archive" -C "${PROJECT_ROOT}/.vercel/output" static

  log_info "Deploying to Cloudflare Pages project='${PROJECT_NAME}' branch='${DEPLOY_BRANCH}'..."
  (
    cd "$PROJECT_ROOT"
    npx wrangler pages deploy ".vercel/output/static" \
      --project-name "$PROJECT_NAME" \
      --branch "$DEPLOY_BRANCH"
  ) 2>&1 | tee "$deploy_log"

  select_latest_deployment

  if [[ -z "${DEPLOYMENT_URL:-}" ]]; then
    DEPLOYMENT_URL="$(grep -Eo 'https://[^ ]+' "$deploy_log" | tail -1 || true)"
  fi

  MANIFEST_ENVIRONMENT="$ENVIRONMENT" \
  MANIFEST_TIMESTAMP_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  MANIFEST_RELEASE_ID="$release_id" \
  MANIFEST_PROJECT_NAME="$PROJECT_NAME" \
  MANIFEST_DEPLOY_BRANCH="$DEPLOY_BRANCH" \
  MANIFEST_SITE_URL="${SITE_URL:-}" \
  MANIFEST_RELEASE_ARCHIVE="$release_archive" \
  MANIFEST_DEPLOY_LOG="$deploy_log" \
  MANIFEST_DEPLOYMENT_ID="${DEPLOYMENT_ID:-}" \
  MANIFEST_DEPLOYMENT_URL="${DEPLOYMENT_URL:-}" \
  MANIFEST_GIT_COMMIT="$(git -C "$PROJECT_ROOT" rev-parse HEAD 2>/dev/null || true)" \
  write_manifest "$manifest_path"

  cp "$manifest_path" "$latest_manifest"
  cleanup_old_releases

  run_smoke_checks

  log_success "Deployment completed."
  log_info "Release archive: ${release_archive}"
  log_info "Manifest: ${manifest_path}"
  if [[ -n "${DEPLOYMENT_ID:-}" ]]; then
    log_info "Deployment ID: ${DEPLOYMENT_ID}"
  fi
  if [[ -n "${DEPLOYMENT_URL:-}" ]]; then
    log_info "Deployment URL: ${DEPLOYMENT_URL}"
  fi
  log_info "To tail Cloudflare logs:"
  log_info "npx wrangler pages deployment tail --project-name ${PROJECT_NAME} --environment $(cloudflare_environment)"
}

main() {
  if [[ "${1:-}" == "staging" || "${1:-}" == "production" ]]; then
    ENVIRONMENT="$1"
    shift
  fi

  while [[ $# -gt 0 ]]; do
    case "$1" in
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
      --skip-validate)
        SKIP_VALIDATE=1
        shift
        ;;
      --skip-tests)
        SKIP_TESTS=1
        shift
        ;;
      --skip-build)
        SKIP_BUILD=1
        shift
        ;;
      --skip-smoke)
        SKIP_SMOKE=1
        shift
        ;;
      --allow-dirty)
        ALLOW_DIRTY=1
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

  log_info "Environment: ${ENVIRONMENT}"
  log_info "Project: ${PROJECT_NAME}"
  log_info "Branch: ${DEPLOY_BRANCH}"
  if [[ -n "$SITE_URL" ]]; then
    log_info "Smoke URL: ${SITE_URL}"
  fi

  preflight
  confirm_production
  run_validation
  build_output
  deploy
}

main "$@"
