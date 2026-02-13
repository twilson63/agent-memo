#!/usr/bin/env node

/**
 * Example: How an agent would use Agent Memo API
 */

const API_URL = 'http://localhost:3000';

/**
 * Agent speaks to user - converts text to audio
 */
async function agentSpeak(text, voice = 'june') {
  console.log(`\n🤖 Agent message: "${text}"`);
  console.log(`🎤 Voice: ${voice}`);
  
  try {
    // Call Agent Memo API
    const response = await fetch(`${API_URL}/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice })
    });
    
    const memo = await response.json();
    
    console.log(`\n✅ Audio generated!`);
    console.log(`📋 Memo ID: ${memo.id}`);
    console.log(`🔗 Audio URL: ${memo.audio.url}`);
    console.log(`📁 File: ${memo.audio.filename} (${memo.audio.length} bytes)`);
    
    return {
      id: memo.id,
      text: memo.text,
      audioUrl: memo.audio.url,
      voice: memo.voice.name,
      createdAt: memo.createdAt
    };
    
  } catch (error) {
    console.error(`❌ Failed to generate audio: ${error.message}`);
    throw error;
  }
}

/**
 * Agent generates welcome message
 */
async function agentWelcomeUser(userName) {
  const message = `Welcome ${userName}! I'm your AI assistant. I can help you with various tasks. Feel free to ask me anything!`;
  return await agentSpeak(message, 'june');
}

/**
 * Agent provides task update
 */
async function agentTaskUpdate(taskName, status) {
  const message = `${taskName} has been updated to status: ${status}. ${status === 'completed' ? 'Great work!' : 'Keep going!'}`;
  return await agentSpeak(message, 'fred');
}

/**
 * Agent sends summary
 */
async function agentSendSummary(items) {
  const message = `Here's your summary: You have ${items.length} items pending. ${items.slice(0, 3).map(i => i).join(', ')}. Would you like more details?`;
  return await agentSpeak(message, 'april');
}

/**
 * Example 1: Simple greeting
 */
async function example1_Greeting() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 1: Agent greeting');
  console.log('='.repeat(70));
  
  await agentSpeak('Hello! How can I help you today?', 'june');
}

/**
 * Example 2: Multiple voices
 */
async function example2_MultipleVoices() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 2: Different voices for different contexts');
  console.log('='.repeat(70));
  
  await agentSpeak('Welcome to our customer service portal.', 'june');
  await agentSpeak('Your ticket has been created successfully.', 'fred');
  await agentSpeak('Thank you for choosing our service!', 'sally');
}

/**
 * Example 3: Long message
 */
async function example3_LongMessage() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 3: Detailed explanation');
  console.log('='.repeat(70));
  
  const longMessage = `Here's a complete overview of your dashboard: 
    You have 5 new messages, 3 pending tasks, and 2 upcoming meetings. 
    Your productivity score improved by 15% this week. 
    Keep up the great work!`;
    
  await agentSpeak(longMessage, 'bill');
}

/**
 * Example 4: Interactive scenario
 */
async function example4_Scenario() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 4: Interactive agent scenario');
  console.log('='.repeat(70));
  
  // Agent welcomes user
  const welcome = await agentWelcomeUser('Alice');
  
  // Agent provides initial task
  const task1 = await agentSpeak('Your first task is to review the quarterly report.', 'fred');
  
  // Agent confirms completion
  const confirmation = await agentSpeak('Excellent! Report reviewed. Next task is to prepare the presentation.', 'sally');
  
  console.log(`\n📊 Session complete! Generated ${3} audio messages.`);
}

/**
 * Example 5: Batch processing
 */
async function example5_BatchProcessing() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 5: Batch message generation');
  console.log('='.repeat(70));
  
  const messages = [
    { text: 'Update: Your order has been shipped!', voice: 'june' },
    { text: 'Reminder: Meeting starts in 10 minutes.', voice: 'fred' },
    { text: 'Tip: Use keyboard shortcuts to save time.', voice: 'bill' },
    { text: 'Congratulations on completing your course!', voice: 'sally' }
  ];
  
  console.log(`Generating ${messages.length} messages...\n`);
  
  const results = await Promise.all(
    messages.map(msg => agentSpeak(msg.text, msg.voice))
  );
  
  console.log(`\n✅ Batch complete! All ${results.length} messages generated.`);
  console.log('\nAudio URLs:');
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.id}: ${r.audioUrl}`);
  });
}

/**
 * Example 6: Error handling
 */
async function example6_ErrorHandling() {
  console.log('\n' + '='.repeat(70));
  console.log('Example 6: Error handling');
  console.log('='.repeat(70));
  
  try {
    // Invalid voice
    await agentSpeak('Hello!', 'invalid-voice');
  } catch (error) {
    console.log(`✅ Caught invalid voice error`);
  }
  
  try {
    // Empty text
    await agentSpeak('', 'june');
  } catch (error) {
    console.log(`✅ Caught empty text error`);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('\n');
  console.log('╔═════════════════════════════════════════════════════════╗');
  console.log('║      📖 Agent Memo API - Usage Examples               ║');
  console.log('╚═════════════════════════════════════════════════════════╝');
  
  await example1_Greeting();
  await example2_MultipleVoices();
  await example3_LongMessage();
  await example4_Scenario();
  await example5_BatchProcessing();
  await example6_ErrorHandling();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ All examples completed successfully!');
  console.log('='.repeat(70));
  console.log('\n💡 Tips for using in production:');
  console.log('   1. Set up environment variables (ELEVENLABS_API_KEY)');
  console.log('   2. Deploy to a hosting platform (Render, Railway, etc.)');
  console.log('   3. Update BASE_URL to your production URL');
  console.log('   4. Add error handling and retry logic');
  console.log('   5. Consider caching frequently used messages');
  console.log('   6. Add authentication if needed\n');
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}

export { agentSpeak, agentWelcomeUser, agentTaskUpdate, agentSendSummary };