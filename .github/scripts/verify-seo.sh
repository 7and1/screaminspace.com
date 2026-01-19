#!/usr/bin/env bash
set -euo pipefail

# Verify SEO metadata

ERRORS=0
WARNINGS=0

error() { echo "::error::$*"; ((ERRORS++)); }
warn() { echo "::warning::$*"; ((WARNINGS++)); }
pass() { echo "[PASS] $*"; }

if [ ! -f "index.html" ]; then
    error "index.html not found"
    exit 1
fi

HTML=$(cat index.html)

# Required SEO elements
check_seo_element() {
    local pattern=$1
    local description=$2

    if echo "$HTML" | grep -q "$pattern"; then
        pass "SEO: $description"
    else
        error "Missing SEO: $description"
    fi
}

check_seo_element 'meta name="description"' 'Meta description'
check_seo_element 'property="og:title"' 'Open Graph title'
check_seo_element 'property="og:description"' 'Open Graph description'
check_seo_element 'property="og:type"' 'Open Graph type'
check_seo_element 'property="og:url"' 'Open Graph URL'
check_seo_element 'property="og:image"' 'Open Graph image'
check_seo_element 'name="twitter:card"' 'Twitter card'
check_seo_element 'rel="canonical"' 'Canonical URL'

# Check robots.txt
if [ -f "robots.txt" ]; then
    pass "robots.txt exists"
    if grep -q "Sitemap:" robots.txt; then
        pass "robots.txt references sitemap"
    else
        warn "robots.txt does not reference sitemap"
    fi
else
    error "robots.txt not found"
fi

# Check sitemap.xml
if [ -f "sitemap.xml" ]; then
    pass "sitemap.xml exists"
    if grep -q "sitemap.org" sitemap.xml; then
        pass "sitemap.xml uses correct schema"
    else
        warn "sitemap.xml may not use correct schema"
    fi
else
    error "sitemap.xml not found"
fi

echo "SEO verification complete: $ERRORS errors, $WARNINGS warnings"
exit $ERRORS
