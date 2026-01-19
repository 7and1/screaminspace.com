#!/usr/bin/env bash
set -euo pipefail

# ============================================
# Scream In Space - Deployment Script
# ============================================
# Usage: ./scripts/deploy.sh [environment]
#   environment: preview | production (default: preview)
#
# Requirements:
#   - Cloudflare Wrangler CLI installed
#   - CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN set
#   - Node.js 20+ for running tests
# ============================================

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script directory
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
readonly PROJECT_NAME="screaminspace"
readonly PRODUCTION_URL="https://screaminspace.com"
readonly MAX_SIZE_MB=25

# Deployment tracking
readonly DEPLOYMENT_LOG="$PROJECT_ROOT/.deployments.json"
readonly ROLLBACK_FILE="$PROJECT_ROOT/.rollback.json"

# ============================================
# Logging Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_step() {
    echo -e "\n${BLUE}==>${NC} $*"
}

# ============================================
# Error Handling
# ============================================

cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "Deployment failed with exit code $exit_code"
        log_info "Check logs above for details"
    fi
    exit $exit_code
}

trap cleanup EXIT

# ============================================
# Utility Functions
# ============================================

check_requirements() {
    log_step "Checking requirements..."

    local missing=()

    # Check for required commands
    command -v node >/dev/null 2>&1 || missing+=("node")
    command -v curl >/dev/null 2>&1 || missing+=("curl")
    command -v jq >/dev/null 2>&1 || missing+=("jq")

    # Check for optional but recommended commands
    if ! command -v wrangler >/dev/null 2>&1; then
        log_warning "wrangler CLI not found. Install for better deployment experience:"
        log_warning "  npm install -g wrangler"
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required commands: ${missing[*]}"
        exit 1
    fi

    # Check for required environment variables
    if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
        log_error "CLOUDFLARE_ACCOUNT_ID environment variable not set"
        log_info "Set it with: export CLOUDFLARE_ACCOUNT_ID=your_account_id"
        exit 1
    fi

    if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
        log_error "CLOUDFLARE_API_TOKEN environment variable not set"
        log_info "Set it with: export CLOUDFLARE_API_TOKEN=your_token"
        exit 1
    fi

    log_success "All requirements met"
}

get_current_branch() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"
}

get_current_sha() {
    git rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

get_deployment_id() {
    local response=$1
    echo "$response" | jq -r '.result.id // empty'
}

# ============================================
# Pre-deployment Checks
# ============================================

run_tests() {
    log_step "Running test suite..."

    cd "$PROJECT_ROOT"

    # Run unit tests
    log_info "Running unit tests..."
    if ! node --test tests/unit/*.test.mjs 2>&1; then
        log_error "Unit tests failed"
        return 1
    fi
    log_success "Unit tests passed"

    # Run integration tests
    log_info "Running integration tests..."
    if ! node --test tests/integration/*.test.mjs 2>&1; then
        log_error "Integration tests failed"
        return 1
    fi
    log_success "Integration tests passed"

    log_success "All tests passed"
}

check_file_sizes() {
    log_step "Checking file sizes..."

    local index_size=$(stat -f%z "$PROJECT_ROOT/index.html" 2>/dev/null || stat -c%s "$PROJECT_ROOT/index.html" 2>/dev/null || echo 0)
    local size_mb=$(echo "scale=2; $index_size / 1048576" | bc)

    log_info "index.html size: ${size_mb}MB"

    if (( $(echo "$size_mb > $MAX_SIZE_MB" | bc -l) )); then
        log_error "index.html exceeds ${MAX_SIZE_MB}MB limit"
        return 1
    fi

    log_success "File sizes within limits"
}

check_required_files() {
    log_step "Checking required files..."

    local required=(
        "index.html"
        "404.html"
        "robots.txt"
        "sitemap.xml"
        "assets/player.png"
        "assets/enemy.png"
        "assets/bullet.png"
    )

    local missing=()

    for file in "${required[@]}"; do
        if [ ! -e "$PROJECT_ROOT/$file" ]; then
            missing+=("$file")
        fi
    done

    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required files: ${missing[*]}"
        return 1
    fi

    log_success "All required files present"
}

validate_html() {
    log_step "Validating HTML structure..."

    # Basic HTML validation checks
    log_info "Checking for doctype..."
    if ! grep -q '<!doctype html' "$PROJECT_ROOT/index.html"; then
        log_error "index.html missing doctype"
        return 1
    fi

    log_info "Checking for viewport meta tag..."
    if ! grep -q 'viewport' "$PROJECT_ROOT/index.html"; then
        log_warning "index.html missing viewport meta tag"
    fi

    log_success "HTML validation passed"
}

# ============================================
# Asset Optimization
# ============================================

optimize_assets() {
    log_step "Optimizing assets..."

    # Check if svgo is available for SVG optimization
    if command -v svgo >/dev/null 2>&1; then
        log_info "Optimizing SVG files..."
        find "$PROJECT_ROOT" -name "*.svg" -type f -exec svgo {} --output {} \; 2>/dev/null || true
    fi

    # Check if pngquant is available for PNG optimization
    if command -v pngquant >/dev/null 2>&1; then
        log_info "Optimizing PNG files..."
        find "$PROJECT_ROOT/assets" -name "*.png" -type f -exec pngquant --ext .png --force {} \; 2>/dev/null || true
    fi

    log_success "Asset optimization complete"
}

# ============================================
# Deployment Functions
# ============================================

create_deployment() {
    local environment=$1
    local branch=${2:-$(get_current_branch)}

    log_step "Creating Cloudflare Pages deployment..."

    local production_flag="false"
    if [ "$environment" = "production" ]; then
        production_flag="true"
    fi

    local response
    response=$(curl -sX POST \
        "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"branch\": \"$branch\",
            \"commit_hash\": \"$(get_current_sha)\",
            \"production\": $production_flag
        }")

    # Check for API errors
    if echo "$response" | jq -e '.errors' | grep -q 'null'; then
        log_error "API request failed"
        echo "$response" | jq -r '.errors[].message' >&2
        return 1
    fi

    local deployment_id
    deployment_id=$(get_deployment_id "$response")

    if [ -z "$deployment_id" ]; then
        log_error "Failed to create deployment"
        echo "$response" | jq '.' >&2
        return 1
    fi

    log_success "Deployment created: $deployment_id"

    # Save deployment info for rollback
    save_deployment_info "$environment" "$deployment_id" "$response"

    echo "$deployment_id"
}

wait_for_deployment() {
    local deployment_id=$1
    local max_wait=${2:-600}  # Default 10 minutes
    local interval=10

    log_step "Waiting for deployment to complete..."

    local elapsed=0
    local stages_url

    while [ $elapsed -lt $max_wait ]; do
        local response
        response=$(curl -s \
            "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$deployment_id" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

        local stage
        local status
        stage=$(echo "$response" | jq -r '.result.latest_stage.stage // "unknown"')
        status=$(echo "$response" | jq -r '.result.latest_stage.status // "unknown"')
        stages_url=$(echo "$response" | jq -r '.result.stages_url // ""')

        log_info "Stage: $stage | Status: $status"

        case $status in
            success)
                log_success "Deployment completed successfully"
                if [ -n "$stages_url" ]; then
                    log_info "Deployment stages: $stages_url"
                fi
                return 0
                ;;
            failure|error)
                log_error "Deployment failed"
                return 1
                ;;
            *)
                # Continue waiting
                ;;
        esac

        sleep $interval
        elapsed=$((elapsed + interval))
    done

    log_error "Deployment timed out after ${max_wait}s"
    return 1
}

# ============================================
# Rollback Functions
# ============================================

save_deployment_info() {
    local environment=$1
    local deployment_id=$2
    local response=$3

    mkdir -p "$(dirname "$ROLLBACK_FILE")"

    local previous_url
    previous_url=$(curl -s \
        "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments?per_page=1" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | \
        jq -r '.result[0].url // ""')

    cat > "$ROLLBACK_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$environment",
  "deployment_id": "$deployment_id",
  "previous_url": "$previous_url",
  "response": $(echo "$response" | jq -c '.result')
}
EOF

    log_info "Saved rollback information"
}

rollback_deployment() {
    local environment=${1:-production}

    log_step "Initiating rollback for $environment..."

    if [ ! -f "$ROLLBACK_FILE" ]; then
        log_warning "No rollback information found"
        log_info "You'll need to rollback manually from the Cloudflare dashboard"
        return 1
    fi

    local previous_url
    previous_url=$(jq -r '.previous_url' "$ROLLBACK_FILE")

    if [ -z "$previous_url" ] || [ "$previous_url" = "null" ]; then
        log_error "No previous deployment URL found"
        return 1
    fi

    log_info "Previous deployment URL: $previous_url"
    log_info "To rollback, use the Cloudflare dashboard:"
    log_info "  https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/pages/view/$PROJECT_NAME"

    # For manual rollback instructions
    log_warning "Automatic rollback via API is limited"
    log_info "Steps to rollback:"
    log_info "  1. Go to Cloudflare Pages dashboard"
    log_info "  2. Find the previous successful deployment"
    log_info "  3. Click 'Promote to Production'"
}

# ============================================
# Post-deployment Verification
# ============================================

run_smoke_tests() {
    local url=${1:-$PRODUCTION_URL}

    log_step "Running smoke tests against $url..."

    # Test 1: Homepage loads
    log_info "Testing homepage..."
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status" != "200" ]; then
        log_error "Homepage returned status $status"
        return 1
    fi
    log_success "Homepage loads (200 OK)"

    # Test 2: Check for game container
    log_info "Testing game container..."
    if ! curl -s "$url" | grep -q 'game-container'; then
        log_warning "Game container not found in HTML"
    else
        log_success "Game container present"
    fi

    # Test 3: Check assets are accessible
    log_info "Testing game assets..."
    for asset in "/assets/player.png" "/assets/enemy.png" "/assets/bullet.png"; do
        local asset_status
        asset_status=$(curl -s -o /dev/null -w "%{http_code}" "${url}${asset}")
        if [ "$asset_status" != "200" ]; then
            log_warning "Asset ${asset} returned status $asset_status"
        else
            log_success "Asset ${asset} accessible"
        fi
    done

    # Test 4: Check 404 page
    log_info "Testing 404 page..."
    local notfound_status
    notfound_status=$(curl -s -o /dev/null -w "%{http_code}" "${url}/this-page-does-not-exist")
    if [ "$notfound_status" != "404" ]; then
        log_warning "404 page returned status $notfound_status (expected 404)"
    else
        log_success "404 page working correctly"
    fi

    log_success "Smoke tests completed"
}

health_check() {
    local url=${1:-$PRODUCTION_URL}

    log_step "Running health checks..."

    local start_time
    start_time=$(date +%s)

    # Check response time
    local response_time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url")

    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    log_info "Response time: ${response_time}s"

    if (( $(echo "$response_time > 5" | bc -l) )); then
        log_warning "Slow response time detected"
    fi

    # Check for SSL
    local ssl_check
    ssl_check=$(curl -sI "$url" | grep -i "strict-transport-security" || echo "")

    if [ -n "$ssl_check" ]; then
        log_success "HSTS header present"
    else
        log_warning "HSTS header not found"
    fi

    log_success "Health check completed"
}

# ============================================
# Deployment Record
# ============================================

record_deployment() {
    local environment=$1
    local deployment_id=$2
    local status=${3:-success}

    mkdir -p "$(dirname "$DEPLOYMENT_LOG")"

    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local branch=$(get_current_branch)
    local sha=$(get_current_sha)

    local new_record
    new_record=$(jq -n \
        --arg ts "$timestamp" \
        --arg env "$environment" \
        --arg id "$deployment_id" \
        --arg status "$status" \
        --arg branch "$branch" \
        --arg sha "$sha" \
        '{
            timestamp: $ts,
            environment: $env,
            deployment_id: $id,
            status: $status,
            branch: $branch,
            sha: $sha
        }')

    if [ -f "$DEPLOYMENT_LOG" ]; then
        local existing
        existing=$(jq '.' "$DEPLOYMENT_LOG")
        echo "$existing" | jq ". += [$new_record]" > "$DEPLOYMENT_LOG"
    else
        echo "[$new_record]" > "$DEPLOYMENT_LOG"
    fi

    log_info "Deployment recorded"
}

# ============================================
# Main Deployment Flow
# ============================================

main() {
    local environment=${1:-preview}
    local skip_tests=${SKIP_TESTS:-false}

    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Scream In Space - Deploy${NC}"
    echo -e "${BLUE}  Environment: $environment${NC}"
    echo -e "${BLUE}========================================${NC}"

    # Determine branch
    local branch="main"
    if [ "$environment" = "preview" ]; then
        branch=$(get_current_branch)
    fi

    # Pre-deployment checks
    check_requirements
    check_required_files
    check_file_sizes
    validate_html

    # Run tests unless skipped
    if [ "$skip_tests" != "true" ]; then
        if ! run_tests; then
            log_error "Tests failed. Use SKIP_TESTS=true to bypass."
            exit 1
        fi
    fi

    # Optimize assets
    optimize_assets

    # Create deployment
    local deployment_id
    if ! deployment_id=$(create_deployment "$environment" "$branch"); then
        log_error "Failed to create deployment"
        exit 1
    fi

    # Wait for deployment to complete
    if ! wait_for_deployment "$deployment_id"; then
        log_error "Deployment failed"
        record_deployment "$environment" "$deployment_id" "failed"

        # Offer rollback
        read -p "Rollback to previous deployment? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback_deployment "$environment"
        fi

        exit 1
    fi

    # Post-deployment verification
    local target_url
    if [ "$environment" = "production" ]; then
        target_url="$PRODUCTION_URL"
    else
        target_url="https://${branch}.${PROJECT_NAME}.pages.dev"
    fi

    run_smoke_tests "$target_url"
    health_check "$target_url"

    # Record successful deployment
    record_deployment "$environment" "$deployment_id" "success"

    log_success "Deployment complete!"
    log_info "URL: $target_url"

    if [ "$environment" = "preview" ]; then
        log_info "Preview URL: https://$branch.$PROJECT_NAME.pages.dev"
    fi
}

# ============================================
# CLI Interface
# ============================================

show_help() {
    cat <<EOF
Usage: ./scripts/deploy.sh [COMMAND] [OPTIONS]

Commands:
  preview     Deploy to preview environment (default)
  production  Deploy to production
  rollback    Rollback to previous deployment
  test        Run pre-deployment tests only
  health      Run health check against production

Options:
  SKIP_TESTS=true    Skip running tests

Environment Variables Required:
  CLOUDFLARE_ACCOUNT_ID    Your Cloudflare account ID
  CLOUDFLARE_API_TOKEN     Your Cloudflare API token with Pages edit permissions

Examples:
  # Deploy to preview
  ./scripts/deploy.sh preview

  # Deploy to production
  ./scripts/deploy.sh production

  # Deploy without running tests
  SKIP_TESTS=true ./scripts/deploy.sh production

  # Rollback production
  ./scripts/deploy.sh rollback production

  # Run health check
  ./scripts/deploy.sh health

EOF
}

case "${1:-preview}" in
    help|--help|-h)
        show_help
        exit 0
        ;;
    health)
        health_check
        exit $?
        ;;
    test)
        check_requirements
        check_required_files
        run_tests
        exit $?
        ;;
    rollback)
        rollback_deployment "${2:-production}"
        exit $?
        ;;
    preview|production)
        main "$1"
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
