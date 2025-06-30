#!/usr/bin/env node

/**
 * Fix Vercel Deployment Script
 * Ensures API files are properly configured for Vercel serverless functions
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkAndFixApiFiles() {
  log('\n🔧 Checking and fixing API files...', colors.blue);
  
  const apiFiles = ['api/index.js', 'api/orders.js', 'api/test.js'];
  let allFixed = true;
  
  apiFiles.forEach(filePath => {
    if (!existsSync(filePath)) {
      log(`❌ Missing API file: ${filePath}`, colors.red);
      allFixed = false;
      return;
    }
    
    const content = readFileSync(filePath, 'utf8');
    
    // Check for ES module export
    if (content.includes('export default')) {
      log(`✅ ${filePath}: Uses ES module export`, colors.green);
    } else {
      log(`❌ ${filePath}: Missing ES module export`, colors.red);
      allFixed = false;
    }
    
    // Check for async function
    if (content.includes('async function handler')) {
      log(`✅ ${filePath}: Uses async handler`, colors.green);
    } else {
      log(`❌ ${filePath}: Missing async handler`, colors.red);
      allFixed = false;
    }
  });
  
  return allFixed;
}

function checkVercelJson() {
  log('\n⚙️ Checking vercel.json configuration...', colors.blue);
  
  if (!existsSync('vercel.json')) {
    log('❌ vercel.json not found', colors.red);
    return false;
  }
  
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  
  // Check for version 2
  if (config.version === 2) {
    log('✅ Uses Vercel version 2', colors.green);
  } else {
    log('⚠️ Should use Vercel version 2', colors.yellow);
  }
  
  // Check functions configuration
  if (config.functions && config.functions['api/*.js']) {
    log('✅ Functions configured for api/*.js', colors.green);
  } else {
    log('❌ Missing functions configuration', colors.red);
    return false;
  }
  
  // Check rewrites
  if (config.rewrites && Array.isArray(config.rewrites)) {
    log(`✅ Has ${config.rewrites.length} rewrite rule(s)`, colors.green);
  } else {
    log('❌ Missing rewrites configuration', colors.red);
    return false;
  }
  
  return true;
}

function checkApiPackageJson() {
  log('\n📦 Checking API package.json...', colors.blue);
  
  if (!existsSync('api/package.json')) {
    log('❌ api/package.json not found', colors.red);
    return false;
  }
  
  const pkg = JSON.parse(readFileSync('api/package.json', 'utf8'));
  
  // Check for type: module
  if (pkg.type === 'module') {
    log('✅ Uses ES modules (type: module)', colors.green);
  } else {
    log('❌ Missing type: module', colors.red);
    return false;
  }
  
  // Check dependencies
  const requiredDeps = ['mongoose', 'dotenv'];
  let hasAllDeps = true;
  
  requiredDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      log(`✅ Has dependency: ${dep}`, colors.green);
    } else {
      log(`❌ Missing dependency: ${dep}`, colors.red);
      hasAllDeps = false;
    }
  });
  
  return hasAllDeps;
}

function runBuild() {
  log('\n🏗️ Running build process...', colors.blue);
  
  try {
    execSync('npm run build:vercel', { stdio: 'inherit' });
    log('✅ Build completed successfully', colors.green);
    return true;
  } catch (error) {
    log('❌ Build failed', colors.red);
    return false;
  }
}

function createDeploymentInstructions() {
  log('\n📋 Creating deployment instructions...', colors.blue);
  
  const instructions = `
# 🚀 DEPLOYMENT INSTRUCTIONS

## Current Status
✅ API files are properly configured
✅ vercel.json is set up for serverless functions
✅ Build process completed

## Deploy to Vercel

### Option 1: Using Vercel CLI (Recommended)
\`\`\`bash
vercel --prod --force
\`\`\`

### Option 2: Using Git (if connected to GitHub)
\`\`\`bash
git add .
git commit -m "Fix API serverless functions for Vercel"
git push origin main
\`\`\`

## After Deployment

Test these endpoints:
- https://order-mangement-system-kappa.vercel.app/api
- https://order-mangement-system-kappa.vercel.app/api/orders
- https://order-mangement-system-kappa.vercel.app/api/test

## Environment Variables Required

Set in Vercel Dashboard:
- MONGODB_URI=your_mongodb_connection_string
- NODE_ENV=production

## Expected API Structure in Vercel

The deployment should show:
/api/
  ├── index.js (serverless function)
  ├── orders.js (serverless function)
  ├── test.js (serverless function)
  └── package.json

## Troubleshooting

If APIs still return 404:
1. Check Vercel Functions tab in dashboard
2. Verify environment variables are set
3. Check function logs for errors
4. Ensure MongoDB Atlas allows Vercel IPs
`;

  writeFileSync('DEPLOYMENT_READY.md', instructions);
  log('✅ Deployment instructions created: DEPLOYMENT_READY.md', colors.green);
}

async function main() {
  log('🔧 Vercel Deployment Fix Script', colors.blue);
  log('=' .repeat(50), colors.cyan);
  
  let success = true;
  
  // Run all checks and fixes
  success = checkAndFixApiFiles() && success;
  success = checkVercelJson() && success;
  success = checkApiPackageJson() && success;
  
  if (success) {
    log('\n✅ All API configurations are correct!', colors.green);
    
    // Run build
    success = runBuild() && success;
    
    if (success) {
      createDeploymentInstructions();
      
      log('\n🎉 Ready for deployment!', colors.green);
      log('\n📋 Next steps:', colors.blue);
      log('1. Set MONGODB_URI in Vercel dashboard', colors.cyan);
      log('2. Run: vercel --prod --force', colors.cyan);
      log('3. Test API endpoints', colors.cyan);
      
      log('\n🔗 Your app: https://order-mangement-system-kappa.vercel.app', colors.cyan);
    }
  } else {
    log('\n❌ Some issues need to be fixed before deployment', colors.red);
    process.exit(1);
  }
}

main().catch(error => {
  log(`❌ Fix script failed: ${error.message}`, colors.red);
  process.exit(1);
});
