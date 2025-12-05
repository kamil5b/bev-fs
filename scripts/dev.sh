#!/usr/bin/env bash
set -e
bun run dev:server &
cd src/client && bunx vite
