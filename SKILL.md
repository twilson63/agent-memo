# Agent Memo Skill

<skill>

## Overview

The Agent Memo skill enables AI agents to convert text to audio using ElevenLabs text-to-speech technology. This allows agents to communicate with users through voice playback, making interactions more engaging and accessible.

**Capability:** Text-to-speech conversion with voice selection
**Category:** Audio/Voice
**API Version:** 1.0.0
**Base URL:** https://api-agent-memo.onrender.com (or your deployment URL)

---

## What This Skill Does

When you use this skill, you can:

1. **Convert text to audio** - Transform any text message into a spoken audio file (MP3)
2. **Choose from multiple voices** - Select from 9 different voice personalities
3. **Get audio URL** - Receive a URL that can be played by users
4. **Reuse memos** - Access previously generated audio memos

---

## Available Voices

| Voice ID | Name | Gender | Personality | Best For |
|----------|------|--------|-------------|----------|
| `june` | June | Female | Friendly, warm | General messages, greetings |
| `april` | April | Female | Casual, conversational | Informal chat, friendly advice |
| `sally` | Sally | Female | Professional, clear | Instructions, explanations |
| `fred` | Fred | Male | Informative, authoritative | Announcements, alerts |
| `bill` | Bill | Male | Direct, firm | Direct commands, important info |
| `charlie` | Charlie | Male | Approachable, friendly | Helpful responses, guidance |
| `dora` | Dora | Female | Enthusiastic, energetic | Exciting announcements, promotions |
| `marcus` | Marcus | Male | Professional, business | Business contexts, formal messages |
| `bella` | Bella | Female | Warm, welcoming | Welcome messages, appreciation |

---

## How to Use

### Basic Usage

Convert a message to audio and get the URL:

```
use agent memo to speak "Hello! How can I help you today?" with voice june
```

The skill will return:
- The audio URL
- Memo ID
- Voice used

### With Different Voices

Choose a voice based on context:

```
use agent memo to speak "Welcome to our platform!" using voice bella

use agent memo to announce "System maintenance in 5 minutes" with voice fred

use agent memo to say "Congratulations on completing the course!" with voice sally
```

### Shorter Syntax

```
speak "Your order is ready" with voice april

announce "Meeting starts soon" with voice bill

say "Great work on that task" with voice charlie
```

---

## Using the Audio URL

Once you receive an audio URL, present it to the user like this:

**Markdown Format:**
```markdown
[Click to hear the message](AUDIO_URL_HERE)
```

**HTML Format:**
```html
<audio controls>
  <source src="AUDIO_URL_HERE" type="audio/mpeg">
  <a href="AUDIO_URL_HERE">Download audio</a>
</audio>
```

**Simple Link:**
```text
🔊 Listen to message: AUDIO_URL_HERE
```

---

## Response Format

When you use the agent memo skill, you'll receive:

```json
{
  "id": "a1b2c3d4",
  "text": "The text you sent",
  "voice": {
    "id": "june",
    "name": "June"
  },
  "audio": {
    "url": "https://api-agent-memo.onrender.com/audio/memo_a1b2c3d4.mp3",
    "filename": "memo_a1b2c3d4.mp3",
    "length": 18432,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T14:30:00.000Z"
}
```

**Important:** The `audio.url` field is what you should present to users.

---

## Voice Selection Guide

### Choose the Right Voice for Context

**Customer Service / Support:**
- Use `june` or `bella` for general support (friendly, warm)
- Use `fred` or `bill` for alerts and issues (authoritative)

**Task Management / Productivity:**
- Use `marcus` or `sally` for task assignments (professional)
- Use `charlie` or `april` for task confirmations (friendly)

**Education / Training:**
- Use `sally` or `marcus` for instructions (clear, professional)
- Use `dora` or `bella` for encouragement (enthusiastic)

**Marketing / Announcements:**
- Use `dora` for exciting announcements (energetic)
- Use `june` for general notifications (friendly)

**Error Messages:**
- Use `fred` or `bill` (direct, authoritative)
- Avoid overly casual voices for errors

---

## Best Practices

### 1. Always Provide Text + Audio

When communicating with users, provide BOTH:

```
Text: Your order was shipped successfully!
Audio: [Click to hear message] (URL)
```

This ensures accessibility and gives users choice.

### 2. Keep Messages Concise

- **Optimal length:** 50-200 words
- **Maximum:** ~5000 characters
- **Tip:** Long messages can be split into multiple memos

### 3. Choose Voice Contextually

```
✅ Good:
Use "june" for welcome messages
Use "fred" for system alerts
Use "bella" for thank you messages

❌ Poor:
Use "dora" (energetic) for error messages
Use "bill" (direct) for friendly greetings
```

### 4. Test Audio URLs

Before presenting to users, verify the URL works:

```
Check: https://api-agent-memo.onrender.com/audio/memo_abc.mp3
```

### 5. Consider Caching

For frequently used messages (greetings, confirmations), consider caching the memo ID to avoid regeneration.

---

## Advanced Usage

### Get Previous Memo

Retrieve a previously created memo:

```
get memo ID a1b2c3d4
```

### List All Memos

Get list of all memos with pagination:

```
list memos limit 10 offset 0
```

### Delete Memo

Remove a memo and its audio file:

```
delete memo ID a1b2c3d4
```

### Available Voices Check

List all available voices:

```
list voices
```

---

## Example Scenarios

### Scenario 1: Customer Service Bot

```
User: "I need help with my order"
Agent: use agent memo to speak "I'd be happy to help you with your order! Could you please provide your order number?" with voice june

Result: 
Text: I'd be happy to help you with your order! Could you please provide your order number?
Audio: [🔊 Click to hear] https://.../audio/memo_abc.mp3
```

### Scenario 2: Task Assignment

```
Agent: use agent memo to announce "New task: Review the quarterly report. Due: Friday 5 PM. Priority: High" using voice fred

Result:
📢 Task Assignment (Voice: Fred)
New task: Review the quarterly report. Due: Friday 5 PM. Priority: High

🔊 Listen: https://.../audio/memo_xyz.mp3
```

### Scenario 3: Welcome Message

```
Agent: use agent memo to say "Welcome! We're glad you're here. Let me know how I can help!" using voice bella

Result:
Welcome! We're glad you're here. Let me know how I can help!
✨ [Click to hear]: https://.../audio/memo_welcome.mp3
```

### Scenario 4: Error Handling

```
Agent: use agent memo to warn "Error: Unable to process your request. Please try again or contact support." with voice fred

Result:
⚠️ Error: Unable to process your request. Please try again or contact support.
🔊 [Listen]: https://.../audio/memo_error.mp3
```

### Scenario 5: Success Confirmation

```
Agent: use agent memo to congratulate "Excellent! Your payment was processed successfully. Receipt sent to your email." with voice charlie

Result:
✅ Success! Your payment was processed successfully. Receipt sent to your email.
🎉 [Click to hear]: https://.../audio/memo_success.mp3
```

---

## Error Handling

### Common Errors

**Error: "Invalid input: text is required"**
- Cause: No text provided
- Solution: Provide the text you want to convert

**Error: "Invalid voice"**
- Cause: Voice ID not recognized
- Solution: Use `list voices` to see available voices

**Error: "Failed to create memo"**
- Cause: ElevenLabs API error or timeout
- Solution: Try again (may need to wait a moment)

---

## Integration with Agent Harness

This skill can be integrated into any agent harness that supports:

1. **REST API calls** - HTTP POST/GET requests
2. **JSON response handling** - Parse JSON responses
3. **URL presentation** - Display URLs to users

### Example Integration Code

```javascript
class AgentMemoSkill {
  constructor(apiUrl = 'https://api-agent-memo.onrender.com') {
    this.apiUrl = apiUrl;
  }
  
  async speak(text, voice = 'june') {
    const response = await fetch(`${this.apiUrl}/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice })
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    return await response.json();
  }
  
  formatResponse(memo) {
    return {
      text: memo.text,
      audioUrl: memo.audio.url,
      playMessage: '🔊 Click to hear the message',
      html: `<audio controls><source src="${memo.audio.url}"></audio>`
    };
  }
}
```

---

## API Endpoints

The skill uses these API endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/memo` | Convert text to audio |
| GET | `/memo/:id` | Get memo by ID |
| GET | `/memos` | List all memos |
| GET | `/voices` | List available voices |
| DELETE | `/memo/:id` | Delete memo |
| GET | `/health` | Health check |

---

## Parameters

### Input Parameters (POST /memo)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | ✅ Yes | - | Text to convert to audio |
| `voice` | string | ❌ No | `june` | Voice to use |

### Output Parameters

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique memo ID |
| `text` | string | The text converted |
| `voice.id` | string | Voice ID used |
| `audio.url` | string | **URL to present to users** |
| `createdAt` | string | Creation timestamp |

---

## Performance Notes

- **Average generation time:** 1-3 seconds per request
- **Supported text length:** Up to ~5000 characters
- **Audio format:** MP3
- **Storage duration:** Memos persist until deleted

---

## Limitations

1. **No real-time streaming** - Audio must be fully generated before URL is available
2. **No custom voices** - Only pre-configured voices available
3. **Local storage** - Audio files stored locally (not on cloud)
4. **No authentication** - v1.0 has no authentication (future versions may have)

---

## Troubleshooting

### Audio not playing

1. Check if URL is accessible in browser
2. Verify the memo ID is correct
3. Check if the service is running: `GET /health`

### Voice not recognized

1. Use `list voices` to see available voices
2. Check spelling (case-insensitive)
3. Verify voice ID (use lowercase)

### Generation takes too long

1. Text may be too long (consider splitting)
2. ElevenLabs API may be slow (try again)
3. Check internet connection

---

## Version History

- **v1.0.0** (2026-02-13) - Initial release
  - 9 voices available
  - MP3 audio format
  - REST API
  - Basic CRUD operations

---

## License

MIT License

---

## Support

- **API Documentation:** https://github.com/twilson63/agent-memo/README.md
- **A2A Specification:** https://github.com/twilson63/agent-memo/A2A-SPECIFICATION.md
- **Issues:** https://github.com/twilson63/agent-memo/issues

---

**This skill enables your agent to speak! 🎙️**

</skill>