#!/usr/bin/env node

/**
 * Vercel Build Script for Monorepo
 * Handles the build process specifically for Vercel deployment
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description, cwd = process.cwd()) {
  log(`\n${colors.blue}🔄 ${description}...${colors.reset}`);
  try {
    const output = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      cwd: cwd
    });
    log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed:${colors.reset}`);
    log(`${colors.red}${error.message}${colors.reset}`);
    return false;
  }
}

async function main() {
  log(`${colors.blue}🚀 Starting Vercel Build Process...${colors.reset}`);
  
  let success = true;
  
  // Check if we're in the right directory
  if (!existsSync('package.json')) {
    log(`${colors.red}❌ Not in project root directory${colors.reset}`);
    process.exit(1);
  }
  
  // Install root dependencies first
  success = runCommand('npm install', 'Install root dependencies') && success;
  
  if (!success) {
    log(`${colors.red}❌ Root dependency installation failed${colors.reset}`);
    process.exit(1);
  }
  
  // Install workspace dependencies
  success = runCommand('npm install --workspace=frontend', 'Install frontend dependencies') && success;
  success = runCommand('npm install --workspace=backend', 'Install backend dependencies') && success;
  
  if (!success) {
    log(`${colors.red}❌ Workspace dependency installation failed${colors.reset}`);
    process.exit(1);
  }
  
  // Check if Vite is available
  try {
    execSync('which vite || npx vite --version', { 
      stdio: 'pipe',
      cwd: path.join(process.cwd(), 'frontend')
    });
    log(`${colors.green}✅ Vite is available${colors.reset}`);
  } catch (error) {
    log(`${colors.yellow}⚠️ Vite not found, will use npx${colors.reset}`);
  }
  
  // Build frontend
  success = runCommand('npm run build', 'Build frontend', path.join(process.cwd(), 'frontend')) && success;
  
  // Check build output
  if (existsSync('frontend/dist/index.html')) {
    log(`${colors.green}✅ Frontend build output verified${colors.reset}`);
  } else {
    log(`${colors.red}❌ Frontend build output missing${colors.reset}`);
    success = false;
  }
  
  if (success) {
    log(`\n${colors.green}🎉 Vercel build completed successfully!${colors.reset}`);
  } else {
    log(`\n${colors.red}❌ Vercel build failed${colors.reset}`);
    process.exit(1);
  }
}

main().catch(error => {
  log(`${colors.red}❌ Build script failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
