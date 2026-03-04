#!/bin/bash
set -euo pipefail

# SiteJSON Web SSR Pre-deployment Validation Script
# Usage: ./scripts/validate.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

ERRORS=0
WARNINGS=0

error_count() {
    log_error "$1"
    ((ERRORS++)) || true
}

warn_count() {
    log_warn "$1"
    ((WARNINGS++)) || true
}

# Check Node.js version
check_node_version() {
    log_info "Checking Node.js version..."

    local node_version
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

    if [ "$node_version" -lt 18 ]; then
        error_count "Node.js 18+ required, found $(node --version)"
    else
        log_success "Node.js version OK ($(node --version))"
    fi
}

# Check for required files
check_required_files() {
    log_info "Checking required files..."

    local required_files=(
        "package.json"
        "tsconfig.json"
        "next.config.js"
        "tailwind.config.ts"
        "vitest.config.ts"
        "playwright.config.ts"
        "wrangler.toml"
    )

    for file in "${required_files[@]}"; do
        if [ ! -f "$PROJECT_ROOT/$file" ]; then
            error_count "Missing required file: $file"
        fi
    done

    if [ $ERRORS -eq 0 ]; then
        log_success "All required files present"
    fi
}

# Check environment variables
check_env_vars() {
    log_info "Checking environment variables..."

    if [ ! -f "$PROJECT_ROOT/.env.local" ] && [ ! -f "$PROJECT_ROOT/.env" ]; then
        warn_count "No .env.local or .env file found"
    fi

    # Check for example env
    if [ ! -f "$PROJECT_ROOT/.env.example" ]; then
        warn_count "No .env.example file found"
    fi
}

# Run linting
run_lint() {
    log_info "Running ESLint..."

    cd "$PROJECT_ROOT"

    if npm run lint 2>/dev/null; then
        log_success "Linting passed"
    else
        error_count "Linting failed"
    fi
}

# Run type checking
run_typecheck() {
    log_info "Running TypeScript type check..."

    cd "$PROJECT_ROOT"

    if npm run typecheck 2>/dev/null; then
        log_success "Type checking passed"
    else
        error_count "Type checking failed"
    fi
}

# Run unit tests
run_unit_tests() {
    log_info "Running unit tests..."

    cd "$PROJECT_ROOT"

    if npm run test 2>/dev/null; then
        log_success "Unit tests passed"
    else
        error_count "Unit tests failed"
    fi
}

# Check test coverage
check_coverage() {
    log_info "Checking test coverage..."

    cd "$PROJECT_ROOT"

    if [ -d "coverage" ]; then
        local coverage_file="$PROJECT_ROOT/coverage/coverage-summary.json"
        if [ -f "$coverage_file" ]; then
            local lines_pct
            lines_pct=$(grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*}' "$coverage_file" | grep -o '"pct":[0-9.]*' | cut -d':' -f2)

            if (( $(echo "$lines_pct < 80" | bc -l) )); then
                warn_count "Code coverage is ${lines_pct}% (target: 80%)"
            else
                log_success "Code coverage OK (${lines_pct}%)"
            fi
        fi
    else
        warn_count "No coverage report found"
    fi
}

# Check for security issues
check_security() {
    log_info "Checking for security issues..."

    cd "$PROJECT_ROOT"

    # Check for common secrets in code
    local secrets_pattern='(password|secret|key|token|api_key)\s*=\s*["\'][^"\']+["\']'
    if grep -rE "$secrets_pattern" --include="*.ts" --include="*.tsx" --include="*.js" "$PROJECT_ROOT/src" "$PROJECT_ROOT/lib" "$PROJECT_ROOT/app" 2>/dev/null | grep -v "\.env" | grep -v "process.env"; then
        warn_count "Potential hardcoded secrets found"
    fi

    log_success "Security check completed"
}

# Check build output size
check_build_size() {
    log_info "Checking build output..."

    if [ -d "$PROJECT_ROOT/.vercel/output/static" ]; then
        local build_size
        build_size=$(du -sm "$PROJECT_ROOT/.vercel/output/static" | cut -f1)

        if [ "$build_size" -gt 100 ]; then
            warn_count "Build size is ${build_size}MB (consider optimization)"
        else
            log_success "Build size OK (${build_size}MB)"
        fi
    else
        warn_count "No build output found. Run 'npm run build:cf' first."
    fi
}

# Check for outdated dependencies
check_outdated_deps() {
    log_info "Checking for outdated dependencies..."

    cd "$PROJECT_ROOT"

    local outdated
    outdated=$(npm outdated --json 2>/dev/null || echo "{}")

    if [ "$outdated" != "{}" ]; then
        warn_count "Outdated dependencies found. Run 'npm outdated' for details."
    else
        log_success "All dependencies up to date"
    fi
}

# Summary
print_summary() {
    echo ""
    echo "========================================"
    echo "Validation Summary"
    echo "========================================"

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        log_success "All checks passed!"
        return 0
    elif [ $ERRORS -eq 0 ]; then
        log_warn "Validation completed with $WARNINGS warning(s)"
        return 0
    else
        log_error "Validation failed with $ERRORS error(s) and $WARNINGS warning(s)"
        return 1
    fi
}

# Main validation flow
main() {
    log_info "Starting pre-deployment validation..."
    log_info "Project root: $PROJECT_ROOT"
    echo ""

    check_node_version
    check_required_files
    check_env_vars
    run_lint
    run_typecheck
    run_unit_tests
    check_coverage
    check_security
    check_build_size
    check_outdated_deps

    print_summary
}

main "$@"
