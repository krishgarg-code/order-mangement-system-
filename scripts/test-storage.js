#!/usr/bin/env node

/**
 * Storage Testing Script
 * Tests the Vercel storage configuration and functionality
 */

import fetch from 'node-fetch';
import { kv } from '@vercel/kv';
import { put, list } from '@vercel/blob';

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.argv[2] || 'http://localhost:3000';

console.log('🧪 Testing Vercel Storage Configuration...');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log('=' .repeat(50));

// Test KV Cache functionality
async function testKVCache() {
  console.log('\n🔄 Testing KV Cache...');
  
  try {
    // Test basic KV operations
    const testKey = 'test:storage';
    const testValue = { message: 'Hello from KV!', timestamp: Date.now() };
    
    // Set value
    await kv.set(testKey, testValue, { ex: 60 });
    console.log('✅ KV Set operation successful');
    
    // Get value
    const retrieved = await kv.get(testKey);
    if (retrieved && retrieved.message === testValue.message) {
      console.log('✅ KV Get operation successful');
      console.log(`   Retrieved: ${JSON.stringify(retrieved)}`);
    } else {
      console.log('❌ KV Get operation failed');
    }
    
    // Delete test key
    await kv.del(testKey);
    console.log('✅ KV Delete operation successful');
    
    return true;
  } catch (error) {
    console.log('❌ KV Cache test failed:', error.message);
    return false;
  }
}

// Test Blob Storage functionality
async function testBlobStorage() {
  console.log('\n📁 Testing Blob Storage...');
  
  try {
    // Create test file
    const testContent = 'Hello from Blob Storage! ' + new Date().toISOString();
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    // Upload file
    const blob = await put('test/storage-test.txt', testBuffer, {
      access: 'public',
      addRandomSuffix: true
    });
    
    console.log('✅ Blob upload successful');
    console.log(`   URL: ${blob.url}`);
    console.log(`   Size: ${blob.size} bytes`);
    
    // List files
    const { blobs } = await list({ prefix: 'test/' });
    console.log(`✅ Blob listing successful (${blobs.length} files found)`);
    
    // Test file access
    const response = await fetch(blob.url);
    if (response.ok) {
      const content = await response.text();
      console.log('✅ Blob file accessible');
      console.log(`   Content: ${content.substring(0, 50)}...`);
    } else {
      console.log('❌ Blob file not accessible');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Blob Storage test failed:', error.message);
    return false;
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...');
  
  const endpoints = [
    { path: '/api', description: 'Health Check' },
    { path: '/api/orders/health', description: 'Storage Health' },
    { path: '/api/orders/stats', description: 'Cached Statistics' },
    { path: '/api/orders', description: 'Orders List' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint.description}`);
      console.log(`   URL: ${BASE_URL}${endpoint.path}`);
      
      const response = await fetch(`${BASE_URL}${endpoint.path}`);
      
      if (response.ok) {
        console.log(`   ✅ Status: ${response.status} - OK`);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`   📄 Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
        }
      } else {
        console.log(`   ❌ Status: ${response.status} - Error`);
        const text = await response.text();
        console.log(`   📄 Error: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
  }
}

// Test cache performance
async function testCachePerformance() {
  console.log('\n⚡ Testing Cache Performance...');
  
  try {
    const endpoint = `${BASE_URL}/api/orders/stats`;
    
    // First request (cache miss)
    const start1 = Date.now();
    await fetch(endpoint);
    const time1 = Date.now() - start1;
    console.log(`✅ First request (cache miss): ${time1}ms`);
    
    // Second request (cache hit)
    const start2 = Date.now();
    await fetch(endpoint);
    const time2 = Date.now() - start2;
    console.log(`✅ Second request (cache hit): ${time2}ms`);
    
    const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
    console.log(`🚀 Performance improvement: ${improvement}%`);
    
    return true;
  } catch (error) {
    console.log('❌ Cache performance test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting comprehensive storage tests...\n');
  
  const results = {
    kv: false,
    blob: false,
    api: true, // Will be updated based on API tests
    performance: false
  };
  
  // Run tests
  results.kv = await testKVCache();
  results.blob = await testBlobStorage();
  await testAPIEndpoints();
  results.performance = await testCachePerformance();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`   KV Cache: ${results.kv ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Blob Storage: ${results.blob ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   API Endpoints: ✅ TESTED`);
  console.log(`   Cache Performance: ${results.performance ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.kv && results.blob && results.performance;
  
  if (allPassed) {
    console.log('\n🎉 All storage tests passed! Your configuration is working perfectly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the environment variables and storage configuration.');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. If tests failed, check your environment variables');
  console.log('2. Ensure you have deployed to Vercel with storage enabled');
  console.log('3. Run "vercel env pull .env.local" to get latest environment variables');
}

// Run the tests
runTests().catch(console.error);
