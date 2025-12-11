#!/bin/bash

# Build and create testbed using the CLI
set -e

# Calculate absolute path to workspace (go up one level from scripts dir)
WORKSPACE_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
FRAMEWORK_PATH="$WORKSPACE_ROOT/packages/framework"
CLI_PATH="$WORKSPACE_ROOT/packages/cli"

# Detect OS for sed compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_INPLACE="sed -i ''"
else
    SED_INPLACE="sed -i"
fi

echo "=== Building Framework ==="
cd "$FRAMEWORK_PATH"
bun run build

echo ""
echo "=== Building CLI ==="
cd "$CLI_PATH"
rm -rf dist/template
bun run build

echo ""
echo "=== Creating testbed using CLI ==="
rm -rf /tmp/bun-testbed
if [ -d /tmp/bun-testbed ]; then
  echo "ERROR: /tmp/bun-testbed still exists after rm -rf"
  exit 1
fi
echo "✓ /tmp/bun-testbed deleted"

cd /tmp
bun "$CLI_PATH/dist/index.js" bun-testbed "$@"
cd /tmp/bun-testbed

echo ""
echo "=== Setting up framework dependency ==="
echo "Using framework from: $FRAMEWORK_PATH"
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|\"bev-fs\": \"[^\"]*\"|\"bev-fs\": \"file:$FRAMEWORK_PATH\"|" package.json
else
    sed -i "s|\"bev-fs\": \"[^\"]*\"|\"bev-fs\": \"file:$FRAMEWORK_PATH\"|" package.json
fi

echo ""
echo "=== Installing dependencies ==="
bun install

echo ""
echo "=== Building client ==="
bun run build

echo ""
echo "=== Ready! Starting dev server... ==="
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3000"
echo ""
bun run dev
