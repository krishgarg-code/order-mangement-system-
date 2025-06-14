#!/usr/bin/env node

/**
 * Build Verification Script
 * Tests the build process locally before deployment
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

function runCommand(command, description) {
  log(`\n${colors.blue}🔄 ${description}...${colors.reset}`);
  try {
    const output = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed:${colors.reset}`);
    log(`${colors.red}${error.message}${colors.reset}`);
    if (error.stdout) {
      log(`${colors.yellow}STDOUT: ${error.stdout}${colors.reset}`);
    }
    if (error.stderr) {
      log(`${colors.yellow}STDERR: ${error.stderr}${colors.reset}`);
    }
    return false;
  }
}

function checkFile(filePath, description) {
  if (existsSync(filePath)) {
    log(`${colors.green}✅ ${description} exists: ${filePath}${colors.reset}`);
    return true;
  } else {
    log(`${colors.red}❌ ${description} missing: ${filePath}${colors.reset}`);
    return false;
  }
}

async function main() {
  log(`${colors.blue}🚀 Starting Build Verification...${colors.reset}`);
  
  let success = true;
  
  // Check if we're in the right directory
  if (!existsSync('package.json')) {
    log(`${colors.red}❌ Not in project root directory${colors.reset}`);
    process.exit(1);
  }
  
  // Clean previous builds
  log(`${colors.blue}🧹 Cleaning previous builds...${colors.reset}`);
  runCommand('npm run clean', 'Clean previous builds');
  
  // Install dependencies
  success = runCommand('npm install', 'Install root dependencies') && success;
  success = runCommand('npm install --workspace=frontend', 'Install frontend dependencies') && success;
  success = runCommand('npm install --workspace=backend', 'Install backend dependencies') && success;
  
  if (!success) {
    log(`${colors.red}❌ Dependency installation failed${colors.reset}`);
    process.exit(1);
  }
  
  // Check if Vite is available in frontend
  try {
    execSync('npx vite --version', { 
      cwd: path.join(process.cwd(), 'frontend'),
      stdio: 'pipe'
    });
    log(`${colors.green}✅ Vite is available in frontend workspace${colors.reset}`);
  } catch (error) {
    log(`${colors.red}❌ Vite not available in frontend workspace${colors.reset}`);
    success = false;
  }
  
  // Build frontend
  success = runCommand('npm run build:frontend', 'Build frontend') && success;
  
  // Build backend
  success = runCommand('npm run build:backend', 'Build backend') && success;
  
  // Check build outputs
  success = checkFile('frontend/dist/index.html', 'Frontend build output') && success;
  success = checkFile('frontend/dist/assets', 'Frontend assets directory') && success;
  
  if (success) {
    log(`\n${colors.green}🎉 Build verification completed successfully!${colors.reset}`);
    log(`${colors.green}✅ Your project is ready for deployment${colors.reset}`);
  } else {
    log(`\n${colors.red}❌ Build verification failed${colors.reset}`);
    log(`${colors.red}Please fix the issues above before deploying${colors.reset}`);
    process.exit(1);
  }
}

main().catch(error => {
  log(`${colors.red}❌ Verification script failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
