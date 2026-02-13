#!/usr/bin/env node

/**
 * Quick Test Script - Try all TTS modes
 */

const BASE_URL = 'http://localhost:3000';

async function testMode(mode) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing Mode: ${mode.toUpperCase()}`);
  console.log('='.repeat(70));
  
  try {
    const response = await fetch(`${BASE_URL}/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Hello! This is a test of the Agent Memo service.",
        voice: "june"
      })
    });
    
    const memo = await response.json();
    
    console.log(`\n✅ Success!`);
    console.log(`   Memo ID: ${memo.id}`);
    console.log(`   Voice: ${memo.voice.name}`);
    console.log(`   Audio URL: ${memo.audio.url}`);
    console.log(`   File Size: ${(memo.audio.length / 1024).toFixed(2)} KB`);
    
    return true;
  } catch (error) {
    console.error(`\n❌ Failed: ${error.message}`);
    return false;
  }
}

async function showInstructions() {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║         🧪 Agent Memo - Quick Test Modes               ║
╚═════════════════════════════════════════════════════════╝

This script helps you test Agent Memo with different TTS modes.

📋 Available Modes:

1. SIMULATION (🎭 Mock)
   • No requirements
   • Returns mock audio
   • For testing API flow
   • Command: TTS_MODE=simulation npm run dev

2. EDGE TTS (🌐 Free)
   • No API key required
   • Real audio from Microsoft
   • Good quality voices
   • Command: TTS_MODE=edge npm run dev

3. ELEVENLABS (🔊 Production)
   • Requires API key
   • Best quality
   • For production use
   • Command: TTS_MODE=elevenlabs ELEVENLABS_API_KEY=xxx npm run dev

🚀 Quick Start:

# Start with simulation mode (no setup)
TTS_MODE=simulation npm run dev

# In another terminal, test it:
node test-modes.mjs

# Want real audio for free?
# Stop server, then:
TTS_MODE=edge npm run dev

# Have ElevenLabs API key?
TTS_MODE=elevenlabs ELEVENLABS_API_KEY=your_key npm run dev

📚 For more details: TESTING-GUIDE.md

`);
}

async function runTests() {
  await showInstructions();
  
  // Check if server is running
  console.log('Checking if Agent Memo is running...');
  try {
    const health = await fetch(`${BASE_URL}/health`);
    const data = await health.json();
    console.log(`✅ Server is running! (${data.service} v${data.version})`);
    console.log(`   TTS Mode: Check the startup message`);
  } catch (error) {
    console.log(`\n❌ Server not running at ${BASE_URL}`);
    console.log(`\nPlease start the server first:`);
    console.log(`  TTS_MODE=simulation npm run dev`);
    console.log(`\nThen run this script again.`);
    return;
  }
  
  // Test current mode
  console.log(`\n🧪 Testing current server mode...`);
  await testMode('current');
  
  console.log(`\n` + '='.repeat(70));
  console.log(`✅ Test complete!`);
  console.log(`=`.repeat(70));
  console.log(`\n💡 Tips:`);
  console.log(`   • Try different modes by restarting the server`);
  console.log(`   • Listen to the audio by opening the URL in a browser`);
  console.log(`   • Check out TESTING-GUIDE.md for detailed instructions\n`);
}

runTests().catch(console.error);