#!/usr/bin/env bash
set -euo pipefail

# SiteJSON Web SSR pre-deployment validation script.
# Usage:
#   ./scripts/validate.sh [--ci] [--skip-lint] [--skip-typecheck] [--skip-tests] [--skip-build] [--skip-security]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

SKIP_LINT=0
SKIP_TYPECHECK=0
SKIP_TESTS=0
SKIP_BUILD=0
SKIP_SECURITY=0
CHECK_CLOUDFLARE_AUTH=0
CI_MODE=0

ERRORS=0
WARNINGS=0

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
Usage: ./scripts/validate.sh [options]

Options:
  --ci                    CI-friendly mode (non-interactive warnings only).
  --check-cloudflare-auth Verify wrangler auth using `wrangler whoami`.
  --skip-lint             Skip npm run lint.
  --skip-typecheck        Skip npm run typecheck.
  --skip-tests            Skip npm run test.
  --skip-build            Skip npm run build:cf.
  --skip-security         Skip hardcoded-secret pattern scan.
  -h, --help              Show this help.
EOF
}

error_count() {
  log_error "$1"
  ERRORS=$((ERRORS + 1))
}

warn_count() {
  log_warn "$1"
  WARNINGS=$((WARNINGS + 1))
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    error_count "Required command not found: $cmd"
    return 1
  fi
  return 0
}

check_node_version() {
  if ! require_command node; then
    return 0
  fi

  local major
  major="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "$major" -lt 20 ]]; then
    error_count "Node.js 20+ required. Found: $(node --version)"
  else
    log_success "Node.js version OK ($(node --version))"
  fi
}

has_any_file() {
  local label="$1"
  shift

  local found=0
  local candidate
  for candidate in "$@"; do
    if [[ -f "${PROJECT_ROOT}/${candidate}" ]]; then
      found=1
      break
    fi
  done

  if [[ "$found" -eq 0 ]]; then
    error_count "Missing required ${label}. Expected one of: $*"
  fi
}

check_required_files() {
  log_info "Checking required files..."

  has_any_file "package manifest" "package.json"
  has_any_file "typescript config" "tsconfig.json"
  has_any_file "next config" "next.config.ts" "next.config.js" "next.config.mjs"
  has_any_file "tailwind config" "tailwind.config.js" "tailwind.config.ts" "tailwind.config.cjs"
  has_any_file "vitest config" "vitest.config.ts" "vitest.config.js"
  has_any_file "playwright config" "playwright.config.ts" "playwright.config.js"
  has_any_file "wrangler config" "wrangler.toml" "wrangler.toml.example"

  if [[ "$ERRORS" -eq 0 ]]; then
    log_success "Required file checks passed"
  fi
}

check_environment_files() {
  log_info "Checking environment templates..."

  if [[ ! -f "${PROJECT_ROOT}/.env.example" ]]; then
    warn_count "Missing .env.example template"
  else
    log_success ".env.example present"
  fi

  if [[ ! -f "${PROJECT_ROOT}/.env.local" && ! -f "${PROJECT_ROOT}/.env" ]]; then
    if [[ "$CI_MODE" -eq 1 ]]; then
      log_info "No local .env/.env.local file (expected in CI)"
    else
      warn_count "No .env.local or .env found. Local commands may fail."
    fi
  fi
}

check_dependencies_installed() {
  log_info "Checking dependencies..."
  if [[ ! -d "${PROJECT_ROOT}/node_modules" ]]; then
    error_count "node_modules missing. Run 'npm ci' before validation."
  else
    log_success "node_modules directory present"
  fi
}

run_step() {
  local label="$1"
  shift

  log_info "$label..."
  if (cd "$PROJECT_ROOT" && "$@"); then
    log_success "$label passed"
  else
    error_count "$label failed"
  fi
}

check_build_output_size() {
  if [[ ! -d "${PROJECT_ROOT}/.vercel/output/static" ]]; then
    warn_count "Build output missing (.vercel/output/static)"
    return 0
  fi

  local size_mb
  size_mb="$(du -sm "${PROJECT_ROOT}/.vercel/output/static" | awk '{print $1}')"
  if [[ "$size_mb" -gt 120 ]]; then
    warn_count "Build output is ${size_mb}MB (>120MB threshold)"
  else
    log_success "Build output size OK (${size_mb}MB)"
  fi
}

check_security_patterns() {
  if [[ "$SKIP_SECURITY" -eq 1 ]]; then
    log_warn "Skipping security pattern scan (--skip-security)."
    return 0
  fi

  require_command rg || return 0

  log_info "Scanning for potential hardcoded secrets (file paths only)..."
  local matches
  matches="$(
    cd "$PROJECT_ROOT"
    rg -l --hidden \
      --glob '!node_modules/**' \
      --glob '!coverage/**' \
      --glob '!.next/**' \
      --glob '!dist/**' \
      --glob '!**/*.md' \
      --glob '!**/*.test.*' \
      --glob '!**/__tests__/**' \
      '(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*["'\''][^"'\'']{8,}["'\'']' \
      app components lib screens scripts 2>/dev/null || true
  )"

  if [[ -n "$matches" ]]; then
    warn_count "Potential hardcoded secret patterns found:"
    echo "$matches" | sed 's/^/  - /'
  else
    log_success "No obvious hardcoded secret patterns detected"
  fi
}

check_cloudflare_auth() {
  if [[ "$CHECK_CLOUDFLARE_AUTH" -eq 0 ]]; then
    return 0
  fi

  run_step "Cloudflare auth check (wrangler whoami)" npx wrangler whoami
}

print_summary() {
  echo ""
  echo "========================================"
  echo "Validation Summary"
  echo "========================================"

  if [[ "$ERRORS" -eq 0 && "$WARNINGS" -eq 0 ]]; then
    log_success "All checks passed"
    return 0
  fi

  if [[ "$ERRORS" -eq 0 ]]; then
    log_warn "Validation passed with ${WARNINGS} warning(s)"
    return 0
  fi

  log_error "Validation failed with ${ERRORS} error(s) and ${WARNINGS} warning(s)"
  return 1
}

main() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ci)
        CI_MODE=1
        shift
        ;;
      --check-cloudflare-auth)
        CHECK_CLOUDFLARE_AUTH=1
        shift
        ;;
      --skip-lint)
        SKIP_LINT=1
        shift
        ;;
      --skip-typecheck)
        SKIP_TYPECHECK=1
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
      --skip-security)
        SKIP_SECURITY=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        error_count "Unknown option: $1"
        shift
        ;;
    esac
  done

  log_info "Starting validation at ${PROJECT_ROOT}"
  require_command npm || true
  require_command npx || true
  check_node_version
  check_required_files
  check_environment_files
  check_dependencies_installed

  if [[ "$SKIP_LINT" -eq 0 ]]; then
    run_step "ESLint" npm run lint
  else
    log_warn "Skipping lint (--skip-lint)."
  fi

  if [[ "$SKIP_TYPECHECK" -eq 0 ]]; then
    run_step "TypeScript typecheck" npm run typecheck
  else
    log_warn "Skipping typecheck (--skip-typecheck)."
  fi

  if [[ "$SKIP_TESTS" -eq 0 ]]; then
    run_step "Unit tests" npm run test
  else
    log_warn "Skipping tests (--skip-tests)."
  fi

  if [[ "$SKIP_BUILD" -eq 0 ]]; then
    run_step "Cloudflare build (build:cf)" npm run build:cf
  else
    log_warn "Skipping build (--skip-build)."
  fi

  check_build_output_size
  check_security_patterns
  check_cloudflare_auth

  print_summary
}

main "$@"
