#!/usr/bin/env bash
set -euo pipefail

# File size checks for deployment

MAX_HTML_SIZE=1048576  # 1MB
MAX_ASSET_SIZE=524288  # 512KB per asset
TOTAL_ASSETS_MAX=2097152  # 2MB total assets

WARNINGS=0
ERRORS=0

warn() { echo "::warning::$*"; ((WARNINGS++)); }
error() { echo "::error::$*"; ((ERRORS++)); }

# Check index.html size
if [ -f "index.html" ]; then
    SIZE=$(stat -f%z "index.html" 2>/dev/null || stat -c%s "index.html" 2>/dev/null)
    SIZE_MB=$(echo "scale=2; $SIZE / 1048576" | bc)
    echo "index.html: ${SIZE_MB}MB"

    if [ $SIZE -gt $MAX_HTML_SIZE ]; then
        error "index.html exceeds ${MAX_HTML_SIZE} bytes"
    fi
else
    error "index.html not found"
fi

# Check individual asset sizes
if [ -d "assets" ]; then
    TOTAL_ASSETS=0
    for asset in assets/*.png assets/*.jpg assets/*.svg 2>/dev/null; do
        if [ -f "$asset" ]; then
            ASSET_SIZE=$(stat -f%z "$asset" 2>/dev/null || stat -c%s "$asset" 2>/dev/null)
            TOTAL_ASSETS=$((TOTAL_ASSETS + ASSET_SIZE))

            ASSET_KB=$(echo "scale=1; $ASSET_SIZE / 1024" | bc)
            echo "$asset: ${ASSET_KB}KB"

            if [ $ASSET_SIZE -gt $MAX_ASSET_SIZE ]; then
                warn "$asset exceeds ${MAX_ASSET_SIZE} bytes"
            fi
        fi
    done

    TOTAL_MB=$(echo "scale=2; $TOTAL_ASSETS / 1048576" | bc)
    echo "Total assets: ${TOTAL_MB}MB"

    if [ $TOTAL_ASSETS -gt $TOTAL_ASSETS_MAX ]; then
        error "Total assets exceed ${TOTAL_ASSETS_MAX} bytes"
    fi
fi

echo "Size check complete: $WARNINGS warnings, $ERRORS errors"
exit $ERRORS
