#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/.site-patrol"
LOG_FILE="${LOG_DIR}/automation-latest.log"

mkdir -p "${LOG_DIR}"
: > "${LOG_FILE}"

log() {
  printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "${LOG_FILE}"
}

fail() {
  log "FAIL: $*"
  exit 1
}

run_cmd() {
  log "RUN: $*"
  (
    cd "${PROJECT_ROOT}"
    "$@"
  ) 2>&1 | tee -a "${LOG_FILE}"
}

detect_package_manager() {
  if [[ -f "${PROJECT_ROOT}/pnpm-lock.yaml" ]]; then
    echo "pnpm"
    return
  fi

  if [[ -f "${PROJECT_ROOT}/package-lock.json" ]]; then
    echo "npm"
    return
  fi

  echo "npm"
}

PACKAGE_MANAGER="$(detect_package_manager)"
BASE_URL="${SITE_PATROL_BASE_URL:-}"

run_script() {
  local script_name="$1"

  if [[ "${PACKAGE_MANAGER}" == "pnpm" ]]; then
    run_cmd pnpm "${script_name}"
  else
    run_cmd npm run "${script_name}"
  fi
}

assert_http_status() {
  local url="$1"
  local expected="$2"
  local body_file
  body_file="$(mktemp)"

  local status
  status="$(curl -sS -L -o "${body_file}" -w '%{http_code}' "${url}")" || {
    rm -f "${body_file}"
    fail "Request failed for ${url}"
  }

  cat "${body_file}" >> "${LOG_FILE}"
  printf '\n' >> "${LOG_FILE}"

  if [[ "${status}" != "${expected}" ]]; then
    rm -f "${body_file}"
    fail "${url} returned ${status}, expected ${expected}"
  fi

  rm -f "${body_file}"
  log "OK: ${url} returned ${status}"
}

assert_page_contains() {
  local url="$1"
  local pattern="$2"
  local body_file
  body_file="$(mktemp)"

  curl -sS -L "${url}" -o "${body_file}" || {
    rm -f "${body_file}"
    fail "Unable to fetch ${url}"
  }

  cat "${body_file}" >> "${LOG_FILE}"
  printf '\n' >> "${LOG_FILE}"

  if ! grep -Eq "${pattern}" "${body_file}"; then
    rm -f "${body_file}"
    fail "${url} did not match expected pattern: ${pattern}"
  fi

  rm -f "${body_file}"
  log "OK: ${url} matched ${pattern}"
}

log "Starting automated site patrol"
log "Package manager: ${PACKAGE_MANAGER}"

run_script lint
run_script typecheck
run_script test
run_script build

if [[ -n "${BASE_URL}" ]]; then
  SANITIZED_BASE_URL="${BASE_URL%/}"
  CANONICAL_BASE_URL="${SITE_PATROL_CANONICAL_BASE_URL:-${SANITIZED_BASE_URL}}"
  log "Running production probes against ${SANITIZED_BASE_URL}"

  assert_http_status "${SANITIZED_BASE_URL}/" "200"
  assert_page_contains "${SANITIZED_BASE_URL}/" '<title>.*SiteJSON'
  assert_http_status "${SANITIZED_BASE_URL}/robots.txt" "200"
  assert_page_contains "${SANITIZED_BASE_URL}/robots.txt" '^Sitemap: .*/sitemap\.xml'
  assert_http_status "${SANITIZED_BASE_URL}/sitemap.xml" "200"
  assert_page_contains "${SANITIZED_BASE_URL}/sitemap.xml" '<urlset'
  assert_http_status "${SANITIZED_BASE_URL}/this-route-should-not-exist-site-patrol" "404"
  assert_page_contains "${SANITIZED_BASE_URL}/this-route-should-not-exist-site-patrol" 'noindex'
  assert_page_contains "${SANITIZED_BASE_URL}/this-route-should-not-exist-site-patrol" 'Page not found'
  run_cmd env SITE_AUDIT_BASE_URL="${SANITIZED_BASE_URL}" SITE_AUDIT_CANONICAL_BASE_URL="${CANONICAL_BASE_URL}" node scripts/live-site-audit.mjs
fi

log "Site patrol completed successfully"
