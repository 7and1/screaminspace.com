#!/usr/bin/env bash
set -euo pipefail

# Validate headers configuration

ERRORS=0

error() { echo "::error::$*"; ((ERRORS++)); }
pass() { echo "[PASS] $*"; }

# Check if _headers file exists
if [ ! -f "_headers" ]; then
    error "_headers file not found"
else
    pass "_headers file exists"

    # Check for required security headers
    REQUIRED_HEADERS=(
        "X-Content-Type-Options"
        "X-Frame-Options"
        "X-XSS-Protection"
        "Permissions-Policy"
    )

    for header in "${REQUIRED_HEADERS[@]}"; do
        if grep -q "$header" "_headers"; then
            pass "Security header configured: $header"
        else
            error "Missing security header: $header"
        fi
    done
fi

# Check if _redirects file exists
if [ ! -f "_redirects" ]; then
    error "_redirects file not found"
else
    pass "_redirects file exists"

    # Check for HTTPS redirect
    if grep -q "https://" "_redirects"; then
        pass "HTTPS redirect configured"
    else
        error "HTTPS redirect not configured"
    fi
fi

echo "Header validation complete: $ERRORS errors"
exit $ERRORS
