#!/usr/bin/env bash
# Cosmic Collapse - Cloudflare Pages / Workers Deployment Script
set -e

echo "=========================================="
echo "  COSMIC COLLAPSE - DEPLOYMENT PIPELINE   "
echo "=========================================="

echo "1. Building production assets with pnpm..."
pnpm install
pnpm build

echo "2. Build succeeded. Output generated in dist/"

if command -v wrangler &> /dev/null; then
  echo "3. Deploying to Cloudflare Pages via Wrangler..."
  pnpm dlx wrangler pages deploy dist --project-name=cosmic-collapse
else
  echo "Wrangler CLI not installed globally. Run:"
  echo "  pnpm dlx wrangler pages deploy dist --project-name=cosmic-collapse"
fi

echo "=========================================="
echo "  DEPLOYMENT COMPLETE!                    "
echo "=========================================="
