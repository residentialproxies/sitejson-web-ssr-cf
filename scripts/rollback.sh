#!/bin/bash
set -euo pipefail

# SiteJSON Web SSR Emergency Rollback Script
# Usage: ./scripts/rollback.sh [staging|production] [version]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-staging}"
VERSION="${2:-}"  # Optional: specific version to rollback to

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

error_exit() {
    log_error "$1"
    exit 1
}

# Confirm rollback
confirm_rollback() {
    log_warn "⚠️  EMERGENCY ROLLBACK REQUESTED"
    log_warn "Environment: $ENVIRONMENT"

    if [ -n "$VERSION" ]; then
        log_warn "Target version: $VERSION"
    else
        log_warn "Target: Previous version"
    fi

    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi
}

# Get deployment history
get_deployment_history() {
    log_info "Fetching deployment history..."

    cd "$PROJECT_ROOT"

    local project_name="sitejson-web-ssr"
    if [ "$ENVIRONMENT" == "staging" ]; then
        project_name="${project_name}-staging"
    fi

    # List recent deployments
    npx wrangler pages deployment list --project-name="$project_name" 2>/dev/null | head -20 || true
}

# Rollback to previous version
rollback_to_previous() {
    log_info "Rolling back to previous version..."

    cd "$PROJECT_ROOT"

    local project_name="sitejson-web-ssr"
    if [ "$ENVIRONMENT" == "staging" ]; then
        project_name="${project_name}-staging"
    fi

    # Get the second most recent deployment
    local previous_deployment
    previous_deployment=$(npx wrangler pages deployment list --project-name="$project_name" 2>/dev/null | sed -n '2p' | awk '{print $1}')

    if [ -z "$previous_deployment" ]; then
        error_exit "Could not find previous deployment"
    fi

    log_info "Rolling back to deployment: $previous_deployment"

    # Trigger rollback
    npx wrangler pages deployment rollback "$previous_deployment" \
        --project-name="$project_name" \
        || error_exit "Rollback failed"

    log_success "Rollback completed"
}

# Rollback to specific version
rollback_to_version() {
    log_info "Rolling back to version: $VERSION"

    cd "$PROJECT_ROOT"

    local project_name="sitejson-web-ssr"
    if [ "$ENVIRONMENT" == "staging" ]; then
        project_name="${project_name}-staging"
    fi

    npx wrangler pages deployment rollback "$VERSION" \
        --project-name="$project_name" \
        || error_exit "Rollback to version $VERSION failed"

    log_success "Rollback to version $VERSION completed"
}

# Verify rollback
verify_rollback() {
    log_info "Verifying rollback..."

    local url
    if [ "$ENVIRONMENT" == "production" ]; then
        url="https://sitejson.com"
    else
        url="https://staging.sitejson.com"
    fi

    local max_attempts=5
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Verification attempt $attempt/$max_attempts..."

        if curl -sf "$url" > /dev/null 2>&1; then
            log_success "Rollback verified: $url is accessible"
            return 0
        fi

        sleep 5
        attempt=$((attempt + 1))
    done

    log_error "Rollback verification failed"
    return 1
}

# Main rollback flow
main() {
    log_info "Starting emergency rollback..."

    if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
        error_exit "Invalid environment. Use 'staging' or 'production'"
    fi

    confirm_rollback
    get_deployment_history

    if [ -n "$VERSION" ]; then
        rollback_to_version
    else
        rollback_to_previous
    fi

    verify_rollback

    log_success "Emergency rollback completed!"
}

main "$@"
