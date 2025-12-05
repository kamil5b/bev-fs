#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bunScript = path.join(__dirname, 'dist', 'index.js');

// Try to spawn with bun, fall back to node if bun not available
const bunProcess = spawn('bun', [bunScript, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
});

bunProcess.on('error', (err) => {
  // If bun not found, fall back to running directly with node
  if (err.code === 'ENOENT') {
    const nodeProcess = spawn('node', [bunScript, ...process.argv.slice(2)], {
      stdio: 'inherit'
    });
    nodeProcess.on('exit', (code) => {
      process.exit(code);
    });
  } else {
    console.error('Failed to spawn bun:', err);
    process.exit(1);
  }
});

bunProcess.on('exit', (code) => {
  process.exit(code || 0);
});
