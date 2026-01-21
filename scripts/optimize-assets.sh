#!/usr/bin/env bash
set -euo pipefail

# ============================================
# Asset Optimization Script
# ============================================
# Optimizes images and assets for production

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[OPTIMIZE]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }

log_info "Starting asset optimization..."

# ============================================
# PNG Optimization
# ============================================

optimize_png() {
    local file=$1

    # Try pngquant first (best compression)
    if command -v pngquant >/dev/null 2>&1; then
        pngquant --quality=65-80 --ext .png --force "$file" 2>/dev/null || true
        log_info "Optimized (pngquant): $file"
    # Fallback to optipng
    elif command -v optipng >/dev/null 2>&1; then
        optipng -o2 -quiet "$file" 2>/dev/null || true
        log_info "Optimized (optipng): $file"
    else
        log_warn "No PNG optimizer found. Install pngquant or optipng."
    fi
}

# Optimize game assets PNGs
for png in "$PROJECT_ROOT"/assets/*.png; do
    if [ -f "$png" ]; then
        optimize_png "$png"
    fi
done

# Optimize OG image if PNG
if [ -f "$PROJECT_ROOT/og-image.png" ]; then
    optimize_png "$PROJECT_ROOT/og-image.png"
fi

# ============================================
# JPEG Optimization
# ============================================

optimize_jpg() {
    local file=$1

    if command -v jpegoptim >/dev/null 2>&1; then
        jpegoptim --max=85 --strip-all "$file" 2>/dev/null || true
        log_info "Optimized (jpegoptim): $file"
    elif command -v mozjpeg >/dev/null 2>&1; then
        mogrify -path "$(dirname "$file")" -format jpg -quality 85 "$file" 2>/dev/null || true
        log_info "Optimized (mozjpeg): $file"
    fi
}

# Check for any JPEG files
for jpg in "$PROJECT_ROOT"/*.jpg "$PROJECT_ROOT"/*.jpeg; do
    if [ -f "$jpg" ]; then
        optimize_jpg "$jpg"
    fi
done 2>/dev/null || true

# ============================================
# SVG Optimization
# ============================================

optimize_svg() {
    local file=$1

    if command -v svgo >/dev/null 2>&1; then
        svgo "$file" -o "$file" --multipass 2>/dev/null || true
        log_info "Optimized (svgo): $file"
    else
        # Basic manual SVG optimization
        # Remove comments, extra whitespace
        sed -i.bak -e '/<!--/d' -e 's/^[[:space:]]*//' "$file" 2>/dev/null || true
        rm -f "${file}.bak"
        log_info "Optimized (sed): $file"
    fi
}

for svg in "$PROJECT_ROOT"/*.svg; do
    if [ -f "$svg" ]; then
        optimize_svg "$svg"
    fi
done 2>/dev/null || true

# ============================================
# HTML Minification (optional)
# ============================================

if [ "${MINIFY_HTML:-false}" = "true" ]; then
    if command -v html-minifier-terser >/dev/null 2>&1; then
        log_info "Minifying HTML..."

        # Backup original
        cp "$PROJECT_ROOT/index.html" "$PROJECT_ROOT/index.html.bak"

        html-minifier-terser \
            --collapse-whitespace \
            --remove-comments \
            --remove-optional-tags \
            --remove-redundant-attributes \
            --remove-script-type-attributes \
            --use-short-doctype \
            --minify-css true \
            --minify-js true \
            -o "$PROJECT_ROOT/index.html" \
            "$PROJECT_ROOT/index.html.bak"

        rm -f "$PROJECT_ROOT/index.html.bak"
        log_info "HTML minified"
    else
        log_warn "html-minifier-terser not found. Install with: npm install -g html-minifier-terser"
    fi
fi

# ============================================
# Report Results
# ============================================

log_info "Asset optimization complete"

# Calculate total size reduction
if command -v du >/dev/null 2>&1; then
    total_size=$(du -sh "$PROJECT_ROOT"/assets 2>/dev/null | cut -f1)
    log_info "Total assets size: $total_size"
fi
