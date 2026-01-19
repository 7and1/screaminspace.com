#!/usr/bin/env bash
set -euo pipefail

# Verify required assets exist

ERRORS=0

error() { echo "::error::$*"; ((ERRORS++)); }
pass() { echo "[PASS] $*"; }

# Required assets
REQUIRED_ASSETS=(
    "assets/player.png"
    "assets/enemy.png"
    "assets/bullet.png"
    "og-image.png"
    "og-image.svg"
)

for asset in "${REQUIRED_ASSETS[@]}"; do
    if [ -f "$asset" ]; then
        # Check file is not empty
        if [ -s "$asset" ]; then
            pass "Asset exists and has content: $asset"
        else
            error "Asset is empty: $asset"
        fi
    else
        error "Asset not found: $asset"
    fi
done

# Verify asset dimensions (if ImageMagick available)
if command -v identify >/dev/null 2>&1; then
    for asset in assets/*.png; do
        if [ -f "$asset" ]; then
            DIMS=$(identify "$asset" 2>/dev/null | awk '{print $3}')
            pass "Asset $asset dimensions: $DIMS"
        fi
    done
else
    echo "ImageMagick not available - skipping dimension checks"
fi

echo "Asset verification complete: $ERRORS errors"
exit $ERRORS
