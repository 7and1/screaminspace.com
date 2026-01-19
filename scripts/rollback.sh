#!/usr/bin/env bash
set -euo pipefail

# ============================================
# Rollback Script
# ============================================
# Quick rollback procedure for failed deployments

ENVIRONMENT="${1:-production}"
PROJECT_NAME="screaminspace"
ROLLBACK_FILE=".rollback.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[ROLLBACK]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# ============================================
# Rollback Functions
# ============================================

show_usage() {
    cat <<EOF
Usage: ./scripts/rollback.sh [environment] [option]

Environment:
  production  Rollback production (default)
  preview     Rollback preview environment

Options:
  --list      List recent deployments
  --to ID     Rollback to specific deployment ID
  --help      Show this help message

Examples:
  ./scripts/rollback.sh production
  ./scripts/rollback.sh production --list
  ./scripts/rollback.sh production --to abc123def456

Environment Variables Required:
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_API_TOKEN

EOF
}

check_requirements() {
    if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
        log_error "CLOUDFLARE_ACCOUNT_ID not set"
        exit 1
    fi

    if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
        log_error "CLOUDFLARE_API_TOKEN not set"
        exit 1
    fi

    if ! command -v jq >/dev/null 2>&1; then
        log_error "jq is required but not installed"
        exit 1
    fi

    if ! command -v curl >/dev/null 2>&1; then
        log_error "curl is required but not installed"
        exit 1
    fi
}

list_deployments() {
    log_info "Fetching recent deployments..."

    local response
    response=$(curl -s \
        "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments?per_page=10" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

    if ! echo "$response" | jq -e '.result' >/dev/null 2>&1; then
        log_error "Failed to fetch deployments"
        echo "$response" | jq -r '.errors[].message' 2>/dev/null || echo "$response"
        exit 1
    fi

    echo ""
    echo "Recent deployments:"
    echo ""

    echo "$response" | jq -r '
        .result[] |
        "\(.id | .[0:8])\t\(.created_on)\t\(.production)\t\(.latest_stage.status)"
    ' | while IFS=$'\t' read -r id created is_prod status; do
        local prod_marker=""
        if [ "$is_prod" = "true" ]; then
            prod_marker="[PROD] "
        fi

        local status_color=""
        case $status in
            success) status_color="${GREEN}" ;;
            failure|error) status_color="${RED}" ;;
            *) status_color="${YELLOW}" ;;
        esac

        echo -e "${BLUE}$id${NC}\t$prod_marker$created\t${status_color}$status${NC}"
    done

    echo ""
    echo "Use full deployment ID to rollback:"
    echo "  ./scripts/rollback.sh $ENVIRONMENT --to <deployment-id>"
}

get_deployment_details() {
    local deployment_id=$1

    local response
    response=$(curl -s \
        "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$deployment_id" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

    echo "$response"
}

rollback_to_deployment() {
    local deployment_id=$1

    log_info "Fetching deployment details for: $deployment_id"

    local deployment
    deployment=$(get_deployment_details "$deployment_id")

    local deployment_url
    deployment_url=$(echo "$deployment" | jq -r '.result.url // empty')

    if [ -z "$deployment_url" ]; then
        log_error "Deployment not found or invalid ID"
        exit 1
    fi

    local deployment_stage
    deployment_stage=$(echo "$deployment" | jq -r '.result.latest_stage.stage // "unknown"')

    local deployment_status
    deployment_status=$(echo "$deployment" | jq -r '.result.latest_stage.status // "unknown"')

    log_info "Deployment: $deployment_url"
    log_info "Stage: $deployment_stage | Status: $deployment_status"

    if [ "$deployment_status" != "success" ]; then
        log_warning "Target deployment did not complete successfully"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Rollback cancelled"
            exit 0
        fi
    fi

    # For Cloudflare Pages, rollback is done by redeploying
    log_info "Initiating rollback..."

    local rollback_response
    rollback_response=$(curl -sX POST \
        "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"branch\": \"main\",
            \"commit_hash\": \"$(echo "$deployment" | jq -r '.result.deployment_trigger.metadata.commit_hash // ""')\",
            \"production\": true
        }")

    local new_deployment_id
    new_deployment_id=$(echo "$rollback_response" | jq -r '.result.id // empty')

    if [ -z "$new_deployment_id" ]; then
        log_error "Failed to create rollback deployment"
        echo "$rollback_response" | jq -r '.errors[].message' 2>/dev/null
        exit 1
    fi

    log_success "Rollback deployment created: $new_deployment_id"
    log_info "Monitoring rollback progress..."

    # Wait for rollback to complete
    local max_wait=300
    local elapsed=0
    local interval=10

    while [ $elapsed -lt $max_wait ]; do
        local status_response
        status_response=$(get_deployment_details "$new_deployment_id")

        local stage
        local status
        stage=$(echo "$status_response" | jq -r '.result.latest_stage.stage // "unknown"')
        status=$(echo "$status_response" | jq -r '.result.latest_stage.status // "unknown"')

        log_info "Stage: $stage | Status: $status"

        case $status in
            success)
                log_success "Rollback completed successfully!"
                log_info "Monitor at: https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/pages/view/$PROJECT_NAME"
                return 0
                ;;
            failure|error)
                log_error "Rollback failed!"
                log_info "Manual intervention required. Visit:"
                log_info "  https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/pages/view/$PROJECT_NAME"
                exit 1
                ;;
        esac

        sleep $interval
        elapsed=$((elapsed + interval))
    done

    log_error "Rollback timed out"
    log_info "Check status at: https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/pages/view/$PROJECT_NAME"
    exit 1
}

auto_rollback() {
    log_info "Attempting automatic rollback..."

    # Check for rollback file
    if [ ! -f "$ROLLBACK_FILE" ]; then
        log_warning "No rollback file found. Listing recent deployments..."
        list_deployments
        exit 1
    fi

    local previous_id
    previous_id=$(jq -r '.previous_deployment_id // empty' "$ROLLBACK_FILE")

    if [ -z "$previous_id" ] || [ "$previous_id" = "null" ]; then
        log_warning "No previous deployment ID in rollback file"
        list_deployments
        exit 1
    fi

    log_info "Rolling back to previous deployment: $previous_id"
    rollback_to_deployment "$previous_id"
}

# ============================================
# Main
# ============================================

case "${2:-}" in
    --list|-l)
        check_requirements
        list_deployments
        ;;
    --to|-t)
        check_requirements
        if [ -z "${3:-}" ]; then
            log_error "Deployment ID required"
            show_usage
            exit 1
        fi
        rollback_to_deployment "$3"
        ;;
    --help|-h)
        show_usage
        exit 0
        ;;
    "")
        check_requirements
        auto_rollback
        ;;
    *)
        log_error "Unknown option: $2"
        show_usage
        exit 1
        ;;
esac
