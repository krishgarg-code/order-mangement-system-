#!/usr/bin/env node

/**
 * Local API Testing Script
 * Tests the API structure without requiring MongoDB connection
 */

import { readFileSync } from 'fs';

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

// Mock request and response objects for testing
function createMockReq(method = 'GET', url = '/') {
  return {
    method,
    url,
    headers: {},
    body: {}
  };
}

function createMockRes() {
  const headers = {};
  const response = {
    statusCode: 200,
    headers: {},
    body: null,
    
    setHeader(name, value) {
      headers[name] = value;
      this.headers[name] = value;
    },
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this.body = JSON.stringify(data);
      return this;
    },
    
    end() {
      return this;
    }
  };
  
  return response;
}

async function testApiFile(filePath, description) {
  log(`\n🧪 Testing ${description}...`, colors.blue);
  
  try {
    // Read the file content
    const content = readFileSync(filePath, 'utf8');
    
    // Check for ES module export
    if (content.includes('export default')) {
      log(`✅ Uses ES module export`, colors.green);
    } else {
      log(`❌ Missing ES module export`, colors.red);
      return false;
    }
    
    // Check for async function
    if (content.includes('async function handler')) {
      log(`✅ Uses async handler function`, colors.green);
    } else {
      log(`❌ Missing async handler function`, colors.red);
      return false;
    }
    
    // Check for CORS headers
    if (content.includes('Access-Control-Allow-Origin')) {
      log(`✅ Includes CORS headers`, colors.green);
    } else {
      log(`❌ Missing CORS headers`, colors.red);
      return false;
    }
    
    // Check for error handling
    if (content.includes('try') && content.includes('catch')) {
      log(`✅ Includes error handling`, colors.green);
    } else {
      log(`❌ Missing error handling`, colors.red);
      return false;
    }
    
    log(`✅ ${description} structure is valid`, colors.green);
    return true;
    
  } catch (error) {
    log(`❌ Error testing ${description}: ${error.message}`, colors.red);
    return false;
  }
}

async function testVercelConfig() {
  log(`\n⚙️ Testing vercel.json configuration...`, colors.blue);
  
  try {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
    
    // Check required fields
    const requiredFields = ['buildCommand', 'outputDirectory', 'functions'];
    let success = true;
    
    requiredFields.forEach(field => {
      if (config[field]) {
        log(`✅ Has ${field}`, colors.green);
      } else {
        log(`❌ Missing ${field}`, colors.red);
        success = false;
      }
    });
    
    // Check routes
    if (config.routes && Array.isArray(config.routes)) {
      log(`✅ Has ${config.routes.length} route(s) configured`, colors.green);
      config.routes.forEach((route, index) => {
        log(`   Route ${index + 1}: ${route.src} → ${route.dest}`, colors.cyan);
      });
    } else {
      log(`❌ Missing or invalid routes configuration`, colors.red);
      success = false;
    }
    
    // Check functions
    if (config.functions && typeof config.functions === 'object') {
      const functionCount = Object.keys(config.functions).length;
      log(`✅ Has ${functionCount} function(s) configured`, colors.green);
      Object.keys(config.functions).forEach(func => {
        log(`   Function: ${func}`, colors.cyan);
      });
    } else {
      log(`❌ Missing or invalid functions configuration`, colors.red);
      success = false;
    }
    
    return success;
    
  } catch (error) {
    log(`❌ Error testing vercel.json: ${error.message}`, colors.red);
    return false;
  }
}

async function testPackageStructure() {
  log(`\n📦 Testing package structure...`, colors.blue);
  
  try {
    // Test root package.json
    const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (rootPkg.scripts && rootPkg.scripts['build:vercel']) {
      log(`✅ Has build:vercel script`, colors.green);
    } else {
      log(`❌ Missing build:vercel script`, colors.red);
      return false;
    }
    
    // Test API package.json
    const apiPkg = JSON.parse(readFileSync('api/package.json', 'utf8'));
    
    const requiredDeps = ['mongoose', 'dotenv'];
    let success = true;
    
    requiredDeps.forEach(dep => {
      if (apiPkg.dependencies && apiPkg.dependencies[dep]) {
        log(`✅ API has ${dep} dependency`, colors.green);
      } else {
        log(`❌ API missing ${dep} dependency`, colors.red);
        success = false;
      }
    });
    
    return success;
    
  } catch (error) {
    log(`❌ Error testing package structure: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  log('🧪 Local API Structure Testing...', colors.blue);
  log('=' .repeat(50), colors.cyan);
  
  let overallSuccess = true;
  
  // Test API files
  const apiTests = [
    { file: 'api/index.js', desc: 'Health Check API' },
    { file: 'api/orders.js', desc: 'Orders API' },
    { file: 'api/test.js', desc: 'Test API' }
  ];
  
  for (const test of apiTests) {
    const result = await testApiFile(test.file, test.desc);
    overallSuccess = overallSuccess && result;
  }
  
  // Test configuration files
  overallSuccess = await testVercelConfig() && overallSuccess;
  overallSuccess = await testPackageStructure() && overallSuccess;
  
  log('\n' + '=' .repeat(50), colors.cyan);
  
  if (overallSuccess) {
    log('🎉 All API structure tests passed!', colors.green);
    log('\n📋 Ready for deployment:', colors.blue);
    log('1. Set MONGODB_URI in Vercel dashboard', colors.cyan);
    log('2. Run: npm run build:vercel', colors.cyan);
    log('3. Deploy: vercel --prod', colors.cyan);
    log('4. Test endpoints after deployment', colors.cyan);
  } else {
    log('❌ Some API structure tests failed.', colors.red);
    log('Please fix the issues above before deploying.', colors.red);
  }
  
  return overallSuccess;
}

main().catch(error => {
  log(`❌ Test script failed: ${error.message}`, colors.red);
  process.exit(1);
});
