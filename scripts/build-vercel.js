#!/usr/bin/env node

/**
 * Vercel Build Script for Monorepo
 * Handles the build process specifically for Vercel deployment
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, cpSync } from 'fs';
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
  log(`${colors.blue}🚀 Starting Single-Service Vercel Build Process...${colors.reset}`);

  let success = true;

  // Check if we're in the right directory
  if (!existsSync('package.json')) {
    log(`${colors.red}❌ Not in project root directory${colors.reset}`);
    process.exit(1);
  }

  log(`${colors.blue}📦 Building single Express server with static frontend${colors.reset}`);

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

  // Create/clean dist directory and copy frontend build using Node.js APIs
  if (success) {
    try {
      log(`${colors.blue}🗂️  Managing dist directory...${colors.reset}`);

      // Remove existing dist directory if it exists
      if (existsSync('dist')) {
        log(`${colors.blue}🧹 Cleaning existing dist directory...${colors.reset}`);
        rmSync('dist', { recursive: true, force: true });
        log(`${colors.green}✅ Existing dist directory cleaned${colors.reset}`);
      }

      // Create new dist directory
      log(`${colors.blue}📁 Creating new dist directory...${colors.reset}`);
      mkdirSync('dist', { recursive: true });
      log(`${colors.green}✅ New dist directory created${colors.reset}`);

      // Copy frontend build to dist directory
      log(`${colors.blue}📋 Copying frontend build to dist...${colors.reset}`);
      cpSync('frontend/dist', 'dist', { recursive: true });
      log(`${colors.green}✅ Frontend build copied to dist${colors.reset}`);

      // Verify the copy worked
      if (existsSync('dist/index.html')) {
        log(`${colors.green}✅ Frontend copied to dist directory successfully${colors.reset}`);
      } else {
        log(`${colors.red}❌ Failed to copy frontend to dist directory${colors.reset}`);
        success = false;
      }
    } catch (error) {
      log(`${colors.red}❌ Error managing dist directory: ${error.message}${colors.reset}`);
      success = false;
    }
  }

  if (success) {
    log(`\n${colors.green}🎉 Single-service build completed successfully!${colors.reset}`);
    log(`${colors.green}📦 Backend will serve both API and static files${colors.reset}`);
  } else {
    log(`\n${colors.red}❌ Build failed${colors.reset}`);
    process.exit(1);
  }
}

main().catch(error => {
  log(`${colors.red}❌ Build script failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
