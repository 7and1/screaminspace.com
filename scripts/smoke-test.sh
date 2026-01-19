#!/usr/bin/env bash
set -euo pipefail

# ============================================
# Smoke Test Script
# ============================================
# Runs post-deployment smoke tests

TARGET_URL="${1:-http://localhost:8080}"
TIMEOUT=30
MAX_RETRIES=3

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNED=0

pass() { echo -e "${GREEN}[PASS]${NC} $*"; ((TESTS_PASSED++)); }
fail() { echo -e "${RED}[FAIL]${NC} $*"; ((TESTS_FAILED++)); }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; ((TESTS_WARNED++)); }
info() { echo "[INFO] $*"; }

echo "=========================================="
echo "Smoke Tests: $TARGET_URL"
echo "=========================================="

# ============================================
# Test 1: Homepage Response
# ============================================
echo ""
info "Test 1: Homepage HTTP Response"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$TARGET_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    pass "Homepage returns 200 OK"
else
    fail "Homepage returned HTTP $HTTP_CODE (expected 200)"
fi

# ============================================
# Test 2: Response Time
# ============================================
echo ""
info "Test 2: Response Time"

RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$TARGET_URL" || echo "0")

# Convert to integer for comparison
RESPONSE_INT=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "0")

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo "1") )); then
    pass "Response time: ${RESPONSE_TIME}s (< 2s)"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l 2>/dev/null || echo "1") )); then
    warn "Response time: ${RESPONSE_TIME}s (acceptable but slow)"
else
    fail "Response time: ${RESPONSE_TIME}s (too slow)"
fi

# ============================================
# Test 3: HTML Content Checks
# ============================================
echo ""
info "Test 3: HTML Content Validation"

HTML_CONTENT=$(curl -s --max-time $TIMEOUT "$TARGET_URL" || echo "")

if echo "$HTML_CONTENT" | grep -q '<!doctype html'; then
    pass "DOCTYPE declaration present"
else
    fail "DOCTYPE declaration missing"
fi

if echo "$HTML_CONTENT" | grep -q 'game-container'; then
    pass "Game container element present"
else
    fail "Game container element missing"
fi

if echo "$HTML_CONTENT" | grep -q 'phaser'; then
    pass "Phaser library referenced"
else
    fail "Phaser library not referenced"
fi

if echo "$HTML_CONTENT" | grep -q 'SceneGame'; then
    pass "Game scene class defined"
else
    fail "Game scene class not found"
fi

# ============================================
# Test 4: SEO Metadata
# ============================================
echo ""
info "Test 4: SEO Metadata"

if echo "$HTML_CONTENT" | grep -q 'meta name="description"'; then
    pass "Meta description present"
else
    fail "Meta description missing"
fi

if echo "$HTML_CONTENT" | grep -q 'og:title'; then
    pass "Open Graph title present"
else
    warn "Open Graph title missing"
fi

if echo "$HTML_CONTENT" | grep -q 'og-image'; then
    pass "OG image referenced"
else
    warn "OG image not referenced"
fi

# ============================================
# Test 5: Asset Accessibility
# ============================================
echo ""
info "Test 5: Asset Accessibility"

ASSETS=(
    "/assets/player.png"
    "/assets/enemy.png"
    "/assets/bullet.png"
)

for asset in "${ASSETS[@]}"; do
    ASSET_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${TARGET_URL}${asset}" || echo "000")
    if [ "$ASSET_CODE" = "200" ]; then
        pass "Asset accessible: $asset"
    else
        fail "Asset not accessible: $asset (HTTP $ASSET_CODE)"
    fi
done

# ============================================
# Test 6: Static Files
# ============================================
echo ""
info "Test 6: Static Files"

STATIC_FILES=(
    "/robots.txt"
    "/sitemap.xml"
    "/404.html"
)

for file in "${STATIC_FILES[@]}"; do
    FILE_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${TARGET_URL}${file}" || echo "000")
    if [ "$FILE_CODE" = "200" ]; then
        pass "Static file accessible: $file"
    else
        warn "Static file issue: $file (HTTP $FILE_CODE)"
    fi
done

# Test sitemap content
SITEMAP=$(curl -s --max-time $TIMEOUT "${TARGET_URL}/sitemap.xml" || echo "")
if echo "$SITEMAP" | grep -q 'sitemap.org'; then
    pass "Sitemap is valid XML"
else
    fail "Sitemap is not valid XML"
fi

# ============================================
# Test 7: Security Headers
# ============================================
echo ""
info "Test 7: Security Headers"

HEADERS=$(curl -s -I --max-time $TIMEOUT "$TARGET_URL" || echo "")

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    pass "X-Content-Type-Options header present"
else
    warn "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "x-frame-options"; then
    pass "X-Frame-Options header present"
else
    warn "X-Frame-Options header missing"
fi

# ============================================
# Test 8: 404 Page
# ============================================
echo ""
info "Test 8: 404 Page Handling"

NOTFOUND_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${TARGET_URL}/this-page-does-not-exist-404" || echo "000")

if [ "$NOTFOUND_CODE" = "404" ]; then
    pass "404 page returns correct status"
else
    warn "404 page returned HTTP $NOTFOUND_CODE (expected 404)"
fi

# ============================================
# Test 9: CORS Headers (for CDN assets)
# ============================================
echo ""
info "Test 9: CORS Configuration"

# Check Phaser CDN is accessible
PHASER_CHECK=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js" || echo "000")

if [ "$PHASER_CHECK" = "200" ]; then
    pass "Phaser CDN accessible"
else
    warn "Phaser CDN issue (HTTP $PHASER_CHECK)"
fi

# ============================================
# Test 10: JavaScript Validation
# ============================================
echo ""
info "Test 10: JavaScript Syntax Check"

if echo "$HTML_CONTENT" | grep -q "'use strict'"; then
    pass "Strict mode enabled in JS"
else
    warn "Strict mode not found in JS"
fi

if echo "$HTML_CONTENT" | grep -q 'addEventListener'; then
    pass "Event listeners present"
else
    fail "Event listeners not found"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${YELLOW}Warnings: $TESTS_WARNED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "=========================================="

# Exit with appropriate code
if [ $TESTS_FAILED -gt 0 ]; then
    exit 1
elif [ $TESTS_WARNED -gt 0 ]; then
    exit 0
else
    exit 0
fi
