#!/usr/bin/env node

/**
 * Test Agent Memo API
 */

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Testing Agent Memo API\n');

async function testHealthCheck() {
  console.log('1️⃣  Testing health check...');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log('✅ Health check passed:', data.status);
    console.log(`   Service: ${data.service} v${data.version}\n`);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

async function testGetVoices() {
  console.log('2️⃣  Testing get voices...');
  try {
    const res = await fetch(`${BASE_URL}/voices`);
    const data = await res.json();
    console.log(`✅ Found ${data.voices.length} voices:`);
    data.voices.forEach(v => {
      console.log(`   • ${v.name} (${v.gender})`);
    });
    console.log('');
    return data.voices;
  } catch (error) {
    console.error('❌ Get voices failed:', error.message);
    process.exit(1);
  }
}

async function testCreateMemo(voice) {
  console.log('3️⃣  Testing create memo...');
  try {
    const res = await fetch(`${BASE_URL}/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Hello! This is a test of the Agent Memo API using ElevenLabs text-to-speech.",
        voice: voice.id
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error('❌ Create memo failed:', error);
      process.exit(1);
    }
    
    const memo = await res.json();
    console.log('✅ Memo created successfully!');
    console.log(`   ID: ${memo.id}`);
    console.log(`   Voice: ${memo.voice.name}`);
    console.log(`   Audio URL: ${memo.audio.url}`);
    console.log(`   File size: ${memo.audio.length} bytes\n`);
    return memo;
  } catch (error) {
    console.error('❌ Create memo failed:', error.message);
    process.exit(1);
  }
}

async function testGetMemo(memoId) {
  console.log('4️⃣  Testing get memo...');
  try {
    const res = await fetch(`${BASE_URL}/memo/${memoId}`);
    
    if (!res.ok) {
      const error = await res.json();
      console.error('❌ Get memo failed:', error);
      process.exit(1);
    }
    
    const memo = await res.json();
    console.log('✅ Memo retrieved successfully!');
    console.log(`   Text: ${memo.text.substring(0, 50)}...`);
    console.log(`   Created: ${memo.createdAt}\n`);
  } catch (error) {
    console.error('❌ Get memo failed:', error.message);
    process.exit(1);
  }
}

async function testListMemos() {
  console.log('5️⃣  Testing list memos...');
  try {
    const res = await fetch(`${BASE_URL}/memos`);
    const data = await res.json();
    console.log('✅ Memos listed successfully!');
    console.log(`   Total: ${data.pagination.total}`);
    console.log(`   Showing: ${data.memos.length}\n`);
  } catch (error) {
    console.error('❌ List memos failed:', error.message);
    process.exit(1);
  }
}

async function runTests() {
  try {
    // Test 1: Health check
    await testHealthCheck();
    
    // Test 2: Get voices
    const voices = await testGetVoices();
    
    // Test 3: Create memo
    const memo = await testCreateMemo(voices[0]);
    
    // Test 4: Get memo
    await testGetMemo(memo.id);
    
    // Test 5: List memos
    await testListMemos();
    
    console.log('='.repeat(70));
    console.log('✅ All tests passed!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();