# Deployment Guide - Scream In Space

This document describes the deployment automation setup for screaminspace.com.

## Overview

- **Hosting**: Cloudflare Pages (static HTML game)
- **CI/CD**: GitHub Actions
- **Domain**: screaminspace.com
- **Preview Deployments**: Automatic on PR

## Quick Start

### Prerequisites

1. **Node.js 20+** for running tests
2. **Cloudflare Account** with Pages enabled
3. **GitHub Repository** with Actions enabled

### Initial Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd screaminspace.com
   npm install
   ```

2. **Configure GitHub Secrets:**
   - Go to: Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
     - `CLOUDFLARE_API_TOKEN` - API token with Pages edit permissions

3. **Connect Cloudflare Pages (first time only):**
   - In Cloudflare dashboard, go to Pages
   - Click "Create a project"
   - Connect to GitHub repository
   - Build settings: Leave empty (static site)

## Deployment Methods

### 1. Automatic Deployments (Recommended)

**Production (main branch):**
```bash
git checkout main
git merge your-feature-branch
git push origin main
```
The GitHub Action automatically deploys to production.

**Preview (Pull Request):**
```bash
git checkout -b feature/my-feature
# Make changes...
git push origin feature/my-feature
# Create PR in GitHub
```
Preview URL appears in PR comments.

### 2. Manual Deployments

**Preview:**
```bash
npm run deploy:preview
# or
bash scripts/deploy.sh preview
```

**Production:**
```bash
npm run deploy:production
# or
bash scripts/deploy.sh production
```

### 3. Skip Tests (Emergency)

```bash
SKIP_TESTS=true npm run deploy:production
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run deploy:preview` | Deploy to preview |
| `npm run deploy:production` | Deploy to production |
| `npm run deploy:rollback` | Rollback production |
| `npm run optimize` | Optimize assets |
| `npm run smoke-test` | Run smoke tests |
| `npm run health-check` | Check production health |
| `npm run validate` | Full validation |

## Rollback Procedure

### Automatic Rollback (On Failure)

If production deployment fails, GitHub Actions will:
1. Detect failure
2. Run rollback script
3. Revert to last known good state

### Manual Rollback

**Option 1: Use rollback script**
```bash
npm run deploy:rollback
# or
bash scripts/rollback.sh production --list
bash scripts/rollback.sh production --to <deployment-id>
```

**Option 2: Cloudflare Dashboard**
1. Go to: https://dash.cloudflare.com
2. Navigate to Pages > screaminspace
3. Find previous successful deployment
4. Click "Promote to Production"

## File Structure

```
screaminspace.com/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # PR tests
│   │   ├── deploy-preview.yml     # Preview deployments
│   │   └── deploy-production.yml  # Production deployments
│   └── scripts/
│       ├── check-sizes.sh         # File size validation
│       ├── validate-headers.sh    # Headers validation
│       ├── verify-seo.sh          # SEO checks
│       └── verify-assets.sh       # Asset verification
├── scripts/
│   ├── deploy.sh                  # Main deployment script
│   ├── optimize-assets.sh         # Asset optimization
│   ├── smoke-test.sh              # Post-deploy tests
│   ├── health-check.sh            # Health monitoring
│   └── rollback.sh                # Rollback procedures
├── pages-functions/
│   └── _middleware.ts             # Edge middleware
├── tests/
│   ├── unit/                      # Unit tests
│   └── integration/               # Integration tests
├── _headers                       # Cloudflare headers
├── _redirects                     # Cloudflare redirects
├── index.html                     # Game entry point
└── wrangler.toml                  # Cloudflare config
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Your Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Yes | API token with Pages edit permissions |
| `ENABLE_ANALYTICS` | No | Enable analytics (default: false) |
| `PREVIEW_DOMAIN` | No | Custom preview domain (default: pages.dev) |

## Headers Configuration

The `_headers` file configures:
- Security headers (CSP, XSS protection, etc.)
- Asset caching strategies
- CORS policies
- Content-Type enforcement

## Redirects Configuration

The `_redirects` file handles:
- HTTPS enforcement
- www to non-www
- Vanity redirects
- Fallback routing

## Health Monitoring

Run health checks against production:
```bash
npm run health-check
# or
bash scripts/health-check.sh https://screaminspace.com
```

Checks performed:
- HTTP response status
- Response time
- Content integrity
- Asset availability
- SSL certificate validity
- DNS resolution
- CDN dependencies

## Troubleshooting

### Deployment Fails

1. **Check logs in GitHub Actions**
2. **Verify environment variables are set**
3. **Run smoke tests locally:**
   ```bash
   npm run smoke-test
   ```

### Assets Not Loading

1. **Verify assets exist:**
   ```bash
   bash .github/scripts/verify-assets.sh
   ```
2. **Check file sizes:**
   ```bash
   bash .github/scripts/check-sizes.sh
   ```

### Rollback Needed

1. **List recent deployments:**
   ```bash
   bash scripts/rollback.sh production --list
   ```
2. **Rollback to specific deployment:**
   ```bash
   bash scripts/rollback.sh production --to <deployment-id>
   ```

## Security Considerations

- Never commit `.env` files
- Use GitHub Secrets for sensitive data
- Rotate API tokens regularly
- Review deployment logs for anomalies
- Keep dependencies updated

## Support

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- GitHub Actions Docs: https://docs.github.com/actions/
- Issues: Create an issue in the repository
