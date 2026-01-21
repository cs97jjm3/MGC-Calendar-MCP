#!/usr/bin/env node

/**
 * MGC Calendar Dashboard Server Launcher
 * 
 * Runs the dashboard server on http://localhost:3737
 * This can be run independently of the MCP tools.
 * 
 * Usage: node scripts/start-dashboard.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dashboardPath = join(__dirname, '..', 'build', 'dashboard.js');

console.log('Starting MGC Calendar Dashboard Server...');
console.log('Dashboard will be available at: http://localhost:3737');
console.log('Press Ctrl+C to stop\n');

const dashboard = spawn('node', [dashboardPath], {
  stdio: 'inherit',
  shell: false
});

dashboard.on('error', (error) => {
  console.error('Failed to start dashboard:', error);
  process.exit(1);
});

dashboard.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Dashboard exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down dashboard server...');
  dashboard.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  dashboard.kill('SIGTERM');
  process.exit(0);
});
