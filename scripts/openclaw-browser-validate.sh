#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_URL="${OPENCLAW_TARGET_URL:-http://127.0.0.1:${OPENCLAW_PORT:?OPENCLAW_PORT is required}/}"
BROWSER_PATHS_JSON="${OPENCLAW_BROWSER_PATHS_JSON:-[\"/\",\"/directory\",\"/data/openai.com\"]}"
ARTIFACT_DIR="${OPENCLAW_ARTIFACT_DIR:-$ROOT_DIR/.openclaw-artifacts}"

mkdir -p "$ARTIFACT_DIR"

cd "$ROOT_DIR"

TARGET_URL="$TARGET_URL" \
BROWSER_PATHS_JSON="$BROWSER_PATHS_JSON" \
ARTIFACT_DIR="$ARTIFACT_DIR" \
node <<'EOF'
const fs = require('fs/promises');
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const targetUrl = process.env.TARGET_URL;
  const paths = JSON.parse(process.env.BROWSER_PATHS_JSON || '["/"]');
  const artifactDir = process.env.ARTIFACT_DIR;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const routePath of paths) {
      const url = new URL(routePath, targetUrl).toString();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const status = response ? response.status() : 0;
      if (status >= 400 || status === 0) {
        throw new Error(`navigation failed for ${url} with status ${status}`);
      }

      await page.locator('body').waitFor({ state: 'visible', timeout: 10000 });
      const safeName = routePath === '/'
        ? 'root'
        : routePath.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
      await page.screenshot({
        path: path.join(artifactDir, `${safeName}.png`),
        fullPage: true,
      });
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
EOF
