#!/usr/bin/env node

/**
 * Test API Structure for Vercel Deployment
 * This script tests if the API can be imported and initialized correctly
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function testAPIStructure() {
  log(`${colors.blue}🧪 Testing API Structure...${colors.reset}`);
  
  try {
    // Test if we can import the API
    log(`${colors.blue}📦 Testing API import...${colors.reset}`);
    const apiPath = join(__dirname, '..', 'api', 'index.js');

    // Convert to file URL for Windows compatibility
    const apiUrl = `file://${apiPath.replace(/\\/g, '/')}`;

    // Dynamic import to test the API
    const { default: app } = await import(apiUrl);
    
    if (app && typeof app === 'function') {
      log(`${colors.green}✅ API imported successfully${colors.reset}`);
    } else {
      log(`${colors.red}❌ API import failed - not a valid Express app${colors.reset}`);
      return false;
    }
    
    // Test if we can access the routes
    log(`${colors.blue}🛣️  Testing route structure...${colors.reset}`);
    
    // Check if the app has the expected middleware and routes
    const routes = app._router?.stack || [];
    log(`${colors.blue}📊 Found ${routes.length} route handlers${colors.reset}`);
    
    // Look for our specific routes
    let foundOrdersRoute = false;
    let foundHealthRoute = false;
    let foundTestRoute = false;
    
    routes.forEach(layer => {
      if (layer.route) {
        const path = layer.route.path;
        if (path === '/orders') foundOrdersRoute = true;
        if (path === '/') foundHealthRoute = true;
        if (path === '/test') foundTestRoute = true;
        log(`${colors.blue}  - Route: ${path}${colors.reset}`);
      }
    });
    
    if (foundOrdersRoute) {
      log(`${colors.green}✅ Orders route found${colors.reset}`);
    } else {
      log(`${colors.yellow}⚠️  Orders route not found in main routes${colors.reset}`);
    }
    
    if (foundHealthRoute) {
      log(`${colors.green}✅ Health check route found${colors.reset}`);
    }
    
    if (foundTestRoute) {
      log(`${colors.green}✅ Test route found${colors.reset}`);
    }
    
    log(`${colors.green}🎉 API structure test completed successfully!${colors.reset}`);
    return true;
    
  } catch (error) {
    log(`${colors.red}❌ API structure test failed:${colors.reset}`);
    log(`${colors.red}${error.message}${colors.reset}`);
    if (error.stack) {
      log(`${colors.red}Stack trace:${colors.reset}`);
      log(`${colors.red}${error.stack}${colors.reset}`);
    }
    return false;
  }
}

async function main() {
  const success = await testAPIStructure();
  
  if (success) {
    log(`\n${colors.green}✅ All tests passed! API is ready for Vercel deployment.${colors.reset}`);
    process.exit(0);
  } else {
    log(`\n${colors.red}❌ Tests failed! Please fix the issues before deploying.${colors.reset}`);
    process.exit(1);
  }
}

main().catch(error => {
  log(`${colors.red}❌ Test script failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
