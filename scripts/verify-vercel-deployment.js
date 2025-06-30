#!/usr/bin/env node

/**
 * Vercel Deployment Verification Script
 * Comprehensive audit and testing for Vercel deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
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

function checkFile(filePath, description) {
  if (existsSync(filePath)) {
    log(`✅ ${description}: ${filePath}`, colors.green);
    return true;
  } else {
    log(`❌ ${description}: ${filePath} (missing)`, colors.red);
    return false;
  }
}

function checkPackageJson() {
  log('\n📦 Checking package.json configuration...', colors.blue);
  
  if (!existsSync('package.json')) {
    log('❌ package.json not found', colors.red);
    return false;
  }
  
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  let success = true;
  
  // Check scripts
  const requiredScripts = ['build', 'build:vercel'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      log(`✅ Script "${script}": ${pkg.scripts[script]}`, colors.green);
    } else {
      log(`❌ Missing script: ${script}`, colors.red);
      success = false;
    }
  });
  
  // Check dependencies
  const requiredDeps = ['mongoose', 'dotenv'];
  requiredDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      log(`✅ Dependency "${dep}": ${pkg.dependencies[dep]}`, colors.green);
    } else {
      log(`❌ Missing dependency: ${dep}`, colors.red);
      success = false;
    }
  });
  
  return success;
}

function checkVercelJson() {
  log('\n⚙️ Checking vercel.json configuration...', colors.blue);
  
  if (!existsSync('vercel.json')) {
    log('❌ vercel.json not found', colors.red);
    return false;
  }
  
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
  let success = true;
  
  // Check build command
  if (vercelConfig.buildCommand) {
    log(`✅ Build command: ${vercelConfig.buildCommand}`, colors.green);
  } else {
    log('❌ Missing buildCommand', colors.red);
    success = false;
  }
  
  // Check output directory
  if (vercelConfig.outputDirectory) {
    log(`✅ Output directory: ${vercelConfig.outputDirectory}`, colors.green);
  } else {
    log('❌ Missing outputDirectory', colors.red);
    success = false;
  }
  
  // Check functions
  if (vercelConfig.functions) {
    log('✅ Functions configuration found:', colors.green);
    Object.keys(vercelConfig.functions).forEach(func => {
      log(`   - ${func}`, colors.cyan);
    });
  } else {
    log('❌ Missing functions configuration', colors.red);
    success = false;
  }
  
  // Check routes
  if (vercelConfig.routes) {
    log('✅ Routes configuration found:', colors.green);
    vercelConfig.routes.forEach((route, index) => {
      log(`   - Route ${index + 1}: ${route.src} → ${route.dest}`, colors.cyan);
    });
  } else {
    log('⚠️ No routes configuration (may cause routing issues)', colors.yellow);
  }
  
  return success;
}

function checkApiFiles() {
  log('\n🔌 Checking API files...', colors.blue);
  
  const apiFiles = [
    { path: 'api/index.js', desc: 'Health check API' },
    { path: 'api/orders.js', desc: 'Orders API' },
    { path: 'api/package.json', desc: 'API dependencies' }
  ];
  
  let success = true;
  
  apiFiles.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      success = false;
    }
  });
  
  // Check API file exports
  const apiJsFiles = ['api/index.js', 'api/orders.js'];
  apiJsFiles.forEach(filePath => {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      if (content.includes('export default')) {
        log(`✅ ${filePath}: Uses ES module export`, colors.green);
      } else if (content.includes('module.exports')) {
        log(`❌ ${filePath}: Uses CommonJS export (should be ES module)`, colors.red);
        success = false;
      } else {
        log(`⚠️ ${filePath}: No clear export pattern found`, colors.yellow);
      }
    }
  });
  
  return success;
}

function checkEnvironmentVariables() {
  log('\n🌍 Checking environment variables...', colors.blue);
  
  const requiredEnvVars = [
    { name: 'MONGODB_URI', required: true },
    { name: 'NODE_ENV', required: false },
    { name: 'VERCEL', required: false }
  ];
  
  let success = true;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar.name]) {
      const value = envVar.name === 'MONGODB_URI' 
        ? process.env[envVar.name].replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')
        : process.env[envVar.name];
      log(`✅ ${envVar.name}: ${value}`, colors.green);
    } else if (envVar.required) {
      log(`❌ Missing required environment variable: ${envVar.name}`, colors.red);
      success = false;
    } else {
      log(`⚠️ Optional environment variable not set: ${envVar.name}`, colors.yellow);
    }
  });
  
  return success;
}

function checkFrontendBuild() {
  log('\n🎨 Checking frontend build...', colors.blue);
  
  let success = true;
  
  // Check if frontend directory exists
  if (!checkFile('frontend', 'Frontend directory')) {
    return false;
  }
  
  // Check frontend package.json
  if (!checkFile('frontend/package.json', 'Frontend package.json')) {
    success = false;
  }
  
  // Check if build output exists
  if (checkFile('frontend/dist/index.html', 'Frontend build output')) {
    log('✅ Frontend appears to be built', colors.green);
  } else {
    log('⚠️ Frontend not built yet (run npm run build:vercel)', colors.yellow);
  }
  
  // Check root dist directory
  if (checkFile('dist/index.html', 'Root dist directory')) {
    log('✅ Root dist directory ready for deployment', colors.green);
  } else {
    log('⚠️ Root dist directory not ready (run npm run build:vercel)', colors.yellow);
  }
  
  return success;
}

async function main() {
  log('🚀 Vercel Deployment Verification Starting...', colors.blue);
  log('=' .repeat(60), colors.cyan);
  
  let overallSuccess = true;
  
  // Run all checks
  overallSuccess = checkPackageJson() && overallSuccess;
  overallSuccess = checkVercelJson() && overallSuccess;
  overallSuccess = checkApiFiles() && overallSuccess;
  overallSuccess = checkEnvironmentVariables() && overallSuccess;
  overallSuccess = checkFrontendBuild() && overallSuccess;
  
  log('\n' + '=' .repeat(60), colors.cyan);
  
  if (overallSuccess) {
    log('🎉 All checks passed! Ready for Vercel deployment.', colors.green);
    log('\n📋 Next steps:', colors.blue);
    log('1. Ensure MONGODB_URI is set in Vercel dashboard', colors.cyan);
    log('2. Deploy using: vercel --prod', colors.cyan);
    log('3. Test API endpoints after deployment', colors.cyan);
  } else {
    log('❌ Some checks failed. Please fix the issues above before deploying.', colors.red);
    log('\n🔧 Common fixes:', colors.blue);
    log('1. Run: npm run build:vercel', colors.cyan);
    log('2. Set environment variables in Vercel dashboard', colors.cyan);
    log('3. Fix API file export patterns', colors.cyan);
  }
}

main().catch(error => {
  log(`❌ Verification script failed: ${error.message}`, colors.red);
  process.exit(1);
});
