#!/usr/bin/env bash
set -euo pipefail

# ============================================
# Health Check Script
# ============================================
# Comprehensive health monitoring for production

TARGET_URL="${1:-https://screaminspace.com}"
TIMEOUT=15

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Health status
HEALTHY=true
CHECKS=()

pass() {
    echo -e "${GREEN}[HEALTHY]${NC} $*"
    CHECKS+=("PASS: $*")
}

fail() {
    echo -e "${RED}[UNHEALTHY]${NC} $*"
    CHECKS+=("FAIL: $*")
    HEALTHY=false
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
    CHECKS+=("WARN: $*")
}

info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

echo "=========================================="
echo "Health Check: $TARGET_URL"
echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "=========================================="

# ============================================
# Check 1: Site Availability
# ============================================
echo ""
info "Checking site availability..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$TARGET_URL" || echo "000")

case $HTTP_CODE in
    200)
        pass "Site is reachable (HTTP 200)"
        ;;
    301|302|307|308)
        # Check redirect destination
        FINAL_URL=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time $TIMEOUT "$TARGET_URL" || echo "")
        if [ -n "$FINAL_URL" ]; then
            info "Redirects to: $FINAL_URL"
            FINAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$FINAL_URL" || echo "000")
            if [ "$FINAL_CODE" = "200" ]; then
                pass "Final destination is healthy (HTTP 200)"
            else
                fail "Final destination returned HTTP $FINAL_CODE"
            fi
        else
            warn "Site redirects but could not follow"
        fi
        ;;
    000)
        fail "Site is unreachable (connection timeout or DNS error)"
        ;;
    503|502|504)
        fail "Site is experiencing server errors (HTTP $HTTP_CODE)"
        ;;
    *)
        fail "Site returned unexpected HTTP code: $HTTP_CODE"
        ;;
esac

# ============================================
# Check 2: Response Time
# ============================================
echo ""
info "Checking response time..."

RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$TARGET_URL" || echo "0")
DNS_TIME=$(curl -s -o /dev/null -w "%{time_namelookup}" --max-time $TIMEOUT "$TARGET_URL" || echo "0")
CONNECT_TIME=$(curl -s -o /dev/null -w "%{time_connect}" --max-time $TIMEOUT "$TARGET_URL" || echo "0")
TLS_TIME=$(curl -s -o /dev/null -w "%{time_appconnect}" --max-time $TIMEOUT "$TARGET_URL" || echo "0")

info "DNS lookup: ${DNS_TIME}s"
info "Connection: ${CONNECT_TIME}s"
info "TLS handshake: ${TLS_TIME}s"
info "Total response: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null || echo "1") )); then
    pass "Response time is excellent (${RESPONSE_TIME}s < 1s)"
elif (( $(echo "$RESPONSE_TIME < 3.0" | bc -l 2>/dev/null || echo "1") )); then
    pass "Response time is good (${RESPONSE_TIME}s < 3s)"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l 2>/dev/null || echo "1") )); then
    warn "Response time is degraded (${RESPONSE_TIME}s < 5s)"
else
    fail "Response time is critical (${RESPONSE_TIME}s > 5s)"
fi

# ============================================
# Check 3: Content Integrity
# ============================================
echo ""
info "Checking content integrity..."

HTML_CONTENT=$(curl -s --max-time $TIMEOUT "$TARGET_URL" || echo "")

# Check for critical elements
CRITICAL_ELEMENTS=(
    "game-container"
    "phaser"
    "SceneGame"
)

for element in "${CRITICAL_ELEMENTS[@]}"; do
    if echo "$HTML_CONTENT" | grep -q "$element"; then
        pass "Critical element found: $element"
    else
        fail "Critical element missing: $element"
    fi
done

# ============================================
# Check 4: Asset Availability
# ============================================
echo ""
info "Checking game assets..."

ASSETS=(
    "/assets/player.png"
    "/assets/enemy.png"
    "/assets/bullet.png"
)

ASSETS_OK=0
for asset in "${ASSETS[@]}"; do
    ASSET_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${TARGET_URL}${asset}" || echo "000")
    if [ "$ASSET_CODE" = "200" ]; then
        ((ASSETS_OK++))
    else
        fail "Asset unavailable: $asset (HTTP $ASSET_CODE)"
    fi
done

if [ $ASSETS_OK -eq ${#ASSETS[@]} ]; then
    pass "All game assets available (${ASSETS_OK}/${#ASSETS[@]})"
fi

# ============================================
# Check 5: SSL/TLS Certificate
# ============================================
echo ""
info "Checking SSL/TLS certificate..."

# Check if site uses HTTPS
if [[ "$TARGET_URL" == https://* ]]; then
    CERT_EXPIRY=$(echo | openssl s_client -servername "${TARGET_URL#https://}" -connect "${TARGET_URL#https://}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")

    if [ -n "$CERT_EXPIRY" ]; then
        EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null || echo "0")
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

        info "Certificate expires: $CERT_EXPIRY ($DAYS_LEFT days)"

        if [ $DAYS_LEFT -lt 0 ]; then
            fail "SSL certificate has expired"
        elif [ $DAYS_LEFT -lt 7 ]; then
            fail "SSL certificate expires in less than 7 days"
        elif [ $DAYS_LEFT -lt 30 ]; then
            warn "SSL certificate expires in less than 30 days"
        else
            pass "SSL certificate is valid"
        fi
    else
        warn "Could not verify SSL certificate"
    fi
else
    warn "Site does not use HTTPS"
fi

# ============================================
# Check 6: DNS Resolution
# ============================================
echo ""
info "Checking DNS resolution..."

DOMAIN=$(echo "$TARGET_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')

if command -v dig >/dev/null 2>&1; then
    DNS_RESULT=$(dig +short "$DOMAIN" A 2>/dev/null || echo "")

    if [ -n "$DNS_RESULT" ]; then
        pass "DNS resolves: $DOMAIN -> $DNS_RESULT"
    else
        fail "DNS does not resolve for $DOMAIN"
    fi
elif command -v nslookup >/dev/null 2>&1; then
    if nslookup "$DOMAIN" >/dev/null 2>&1; then
        pass "DNS resolves for $DOMAIN"
    else
        fail "DNS does not resolve for $DOMAIN"
    fi
fi

# ============================================
# Check 7: CDN Dependencies
# ============================================
echo ""
info "Checking CDN dependencies..."

CDN_URLS=(
    "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js"
    "https://fonts.googleapis.com"
)

for url in "${CDN_URLS[@]}"; do
    CDN_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" || echo "000")
    if [ "$CDN_CODE" = "200" ] || [ "$CDN_CODE" = "304" ]; then
        pass "CDN accessible: $url"
    else
        warn "CDN issue: $url (HTTP $CDN_CODE)"
    fi
done

# ============================================
# Check 8: Headers Check
# ============================================
echo ""
info "Checking response headers..."

HEADERS=$(curl -s -I --max-time $TIMEOUT "$TARGET_URL" || echo "")

# Security headers
SECURITY_HEADERS=(
    "X-Content-Type-Options"
    "X-Frame-Options"
    "Content-Security-Policy"
)

for header in "${SECURITY_HEADERS[@]}"; do
    if echo "$HEADERS" | grep -qi "$header"; then
        pass "Security header present: $header"
    else
        warn "Security header missing: $header"
    fi
done

# Cache headers
if echo "$HEADERS" | grep -qi "cache-control"; then
    CACHE_CONTROL=$(echo "$HEADERS" | grep -i "cache-control" | head -1)
    info "Cache-Control: $CACHE_CONTROL"
fi

# ============================================
# Check 9: Page Size
# ============================================
echo ""
info "Checking page size..."

PAGE_SIZE=$(curl -s --max-time $TIMEOUT "$TARGET_URL" | wc -c | tr -d ' ')
PAGE_SIZE_KB=$(echo "scale=2; $PAGE_SIZE / 1024" | bc)

info "Page size: ${PAGE_SIZE_KB}KB"

if [ $PAGE_SIZE -lt 1048576 ]; then  # Less than 1MB
    pass "Page size is acceptable"
elif [ $PAGE_SIZE -lt 5242880 ]; then  # Less than 5MB
    warn "Page size is large"
else
    fail "Page size is too large"
fi

# ============================================
# Generate Health Report
# ============================================
echo ""
echo "=========================================="
echo "Health Report"
echo "=========================================="

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}Status: HEALTHY${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}Status: UNHEALTHY${NC}"
    EXIT_CODE=1
fi

echo ""
echo "Checks performed:"
for check in "${CHECKS[@]}"; do
    echo "  - $check"
done

# Log health check result
if [ -n "${HEALTH_LOG:-}" ]; then
    {
        echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Health check for $TARGET_URL"
        echo "Status: $([ "$HEALTHY" = true ] && echo "HEALTHY" || echo "UNHEALTHY")"
        echo "Checks:"
        for check in "${CHECKS[@]}"; do
            echo "  - $check"
        done
        echo ""
    } >> "$HEALTH_LOG"
fi

exit $EXIT_CODE
