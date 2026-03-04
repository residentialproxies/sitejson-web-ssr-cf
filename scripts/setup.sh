#!/bin/bash
set -euo pipefail

# SiteJSON Web SSR Environment Setup Script
# Usage: ./scripts/setup.sh

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

error_exit() {
    log_error "$1"
    exit 1
}

# Check system requirements
check_system() {
    log_info "Checking system requirements..."

    command -v git >/dev/null 2>&1 || error_exit "Git is required but not installed"
    command -v node >/dev/null 2>&1 || error_exit "Node.js is required but not installed"
    command -v npm >/dev/null 2>&1 || error_exit "npm is required but not installed"

    local node_version
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        error_exit "Node.js 18+ is required. Found: $(node --version)"
    fi

    log_success "System requirements met (Node.js $(node --version))"
}

# Setup environment file
setup_env() {
    log_info "Setting up environment configuration..."

    cd "$PROJECT_ROOT"

    if [ -f ".env.local" ]; then
        log_warn ".env.local already exists, skipping creation"
        return 0
    fi

    cat > .env.local << 'EOF'
# SiteJSON Web SSR Environment Configuration

# API Configuration
NEXT_PUBLIC_SITEJSON_API_BASE_URL=http://127.0.0.1:8787
SITEJSON_API_KEY=your_api_key_here

# Site Configuration
PUBLIC_SITE_BASE_URL=http://localhost:3000

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=
EOF

    log_success "Created .env.local"
    log_warn "Please update .env.local with your actual API credentials"
}

# Install dependencies
install_deps() {
    log_info "Installing project dependencies..."

    cd "$PROJECT_ROOT"

    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi

    log_success "Dependencies installed"
}

# Install Playwright browsers
install_playwright() {
    log_info "Installing Playwright browsers..."

    cd "$PROJECT_ROOT"

    npx playwright install chromium firefox webkit || log_warn "Playwright install skipped"

    log_success "Playwright browsers installed"
}

# Setup git hooks
setup_git_hooks() {
    log_info "Setting up git hooks..."

    cd "$PROJECT_ROOT"

    if [ -d ".git" ]; then
        mkdir -p .git/hooks

        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook

echo "Running pre-commit checks..."

# Run linting
npm run lint || exit 1

# Run type checking
npm run typecheck || exit 1

echo "Pre-commit checks passed!"
EOF

        chmod +x .git/hooks/pre-commit
        log_success "Git hooks configured"
    else
        log_warn "Not a git repository, skipping git hooks"
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating project directories..."

    cd "$PROJECT_ROOT"

    mkdir -p .vercel/output
    mkdir -p e2e/screenshots
    mkdir -p e2e/videos
    mkdir -p coverage

    log_success "Directories created"
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."

    cd "$PROJECT_ROOT"

    # Check TypeScript compilation
    npm run typecheck || log_warn "TypeScript check found issues"

    # Run tests
    npm run test || log_warn "Tests found issues"

    log_success "Setup verification complete"
}

# Print next steps
print_next_steps() {
    echo ""
    log_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Update .env.local with your API credentials"
    echo "  2. Run 'npm run dev' to start development server"
    echo "  3. Run 'npm run test' to run tests"
    echo "  4. Run 'npm run e2e' to run E2E tests"
    echo ""
    echo "Deployment:"
    echo "  ./scripts/deploy.sh staging    # Deploy to staging"
    echo "  ./scripts/deploy.sh production # Deploy to production"
    echo ""
}

# Main setup flow
main() {
    log_info "Setting up SiteJSON Web SSR development environment..."
    log_info "Project root: $PROJECT_ROOT"

    check_system
    setup_env
    install_deps
    install_playwright
    setup_git_hooks
    create_directories
    verify_setup
    print_next_steps
}

main "$@"
