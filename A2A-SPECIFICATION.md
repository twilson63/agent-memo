# Agent-to-Agent (A2A) Specification: Agent Memo

**Version:** 1.0.0
**Service:** Agent Memo API
**Base URL:** `https://api-agent-memo.onrender.com` (or your deployment URL)
**Last Updated:** 2026-02-13

---

## 📋 Overview

The Agent Memo service provides text-to-speech capabilities for AI agents. Agents can send text and voice preferences to generate audio files (MP3) that can be played by end users.

**Use Case:** When an agent wants to communicate via voice instead of text, it uses this service to generate an audio URL to present to the user.

---

## 🎯 Agent Interaction Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Agent (Caller)                       │
│                                                         │
│  1. Generate message to communicate to user           │
│  2. Determine voice preference (optional)              │
│  3. Call Agent Memo API                                │
│  4. Receive audio URL                                  │
│  5. Present URL to user                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ POST /memo {text, voice}
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Agent Memo Service (Provider)              │
│                                                         │
│  1. Validate request                                   │
│  2. Call ElevenLabs TTS                                │
│  3. Store audio file                                   │
│  4. Return URL                                         │
└─────────────────────────────────────────────────────────┘
                 │
                 │ Return {id, audioUrl}
                 ▼
┌─────────────────────────────────────────────────────────┐
│                     End User                            │
│                                                         │
│  User clicks audio player → Audio plays! 🎵             │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 Service Endpoints

### 1. Create Memo (Convert Text to Audio)

**Purpose:** Generate audio from text using specified voice.

**Endpoint:** `POST /memo`

**Request:**

```json
{
  "text": "string (required)",
  "voice": "string (optional, default: june)"
}
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `text` | string | ✅ Yes | - | Text to convert to audio (max ~5000 characters) |
| `voice` | string | ❌ No | `june` | Voice to use (see available voices) |

**Available Voices:**

| Voice ID | Name | Gender | Best For |
|----------|------|--------|----------|
| `june` | June | Female | General, friendly |
| `april` | April | Female | Casual, conversational |
| `sally` | Sally | Female | Professional, clear |
| `fred` | Fred | Male | Informative, announcements |
| `bill` | Bill | Male | Direct, authoritative |
| `charlie` | Charlie | Male | Friendly, approachable |
| `dora` | Dora | Female | Enthusiastic, energetic |
| `marcus` | Marcus | Male | Professional, business |
| `bella` | Bella | Female | Warm, welcoming |

**Response (201 Created):**

```json
{
  "id": "string",
  "text": "string",
  "voice": {
    "id": "string",
    "name": "string"
  },
  "audio": {
    "filename": "string.mp3",
    "url": "https://...",
    "length": "number",
    "format": "mp3"
  },
  "createdAt": "ISO 8601 timestamp"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique memo ID (8-character hex) |
| `text` | string | The text that was converted |
| `voice` | object | Voice information used |
| `audio.url` | string | **The URL to present to users** |
| `audio.length` | number | File size in bytes |
| createdAt | string | Creation timestamp |

**Example Request:**

```bash
curl -X POST https://api-agent-memo.onrender.com/memo \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! I can help you find what you are looking for.",
    "voice": "june"
  }'
```

**Example Response:**

```json
{
  "id": "a1b2c3d4",
  "text": "Hello! I can help you find what you are looking for.",
  "voice": {
    "id": "june",
    "name": "June"
  },
  "audio": {
    "filename": "memo_a1b2c3d4.mp3",
    "url": "https://api-agent-memo.onrender.com/audio/memo_a1b2c3d4.mp3",
    "length": 18342,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T14:30:00.000Z"
}
```

---

### 2. Get Memo by ID

**Purpose:** Retrieve a previously created memo.

**Endpoint:** `GET /memo/:memoId`

**Response (200 OK):** Same structure as create response

**Response (404 Not Found):**

```json
{
  "error": "Memo not found",
  "memoId": "string"
}
```

---

### 3. List All Memos

**Purpose:** List available memos with pagination.

**Endpoint:** `GET /memos?limit=20&offset=0`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of results to return (max: 100) |
| `offset` | integer | 0 | Number of results to skip |

**Response:**

```json
{
  "memos": [
    { "id": "...", "text": "...", "audio": { "url": "..." } }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number",
    "hasMore": "boolean"
  }
}
```

---

### 4. Get Available Voices

**Purpose:** List all available voices.

**Endpoint:** `GET /voices`

**Response:**

```json
{
  "voices": [
    {
      "id": "june",
      "name": "June",
      "gender": "female"
    }
  ]
}
```

---

### 5. Delete Memo

**Purpose:** Delete a memo and its audio file.

**Endpoint:** `DELETE /memo/:memoId`

**Response (200 OK):**

```json
{
  "message": "Memo deleted",
  "memoId": "string"
}
```

---

### 6. Health Check

**Purpose:** Check service availability.

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "ok",
  "service": "Agent Memo",
  "version": "1.0.0",
  "timestamp": "..."
}
```

---

## 🔐 Authentication

**Current Status:** No authentication required (v1.0)

**Future Plans:** API key-based authentication

---

## ⚡ Performance Considerations

### Generation Time

- **Typical TTS Generation:** 1-3 seconds per request
- **Very long text (>1000 words):** Up to 10 seconds

### Rate Limits

- **Current:** No hard limits enforced by service
- **ElevenLabs:** Check your ElevenLabs plan for quota limits
- **Recommendation:** Implement client-side rate limiting for production

### Caching Strategy

```javascript
// Cache frequently used messages to avoid regeneration
const messageCache = new Map();

async function getOrGenerateMemo(text, voice) {
  const cacheKey = `${voice}:${hash(text)}`;
  
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey);
  }
  
  const memo = await createMemo(text, voice);
  messageCache.set(cacheKey, memo);
  return memo;
}
```

---

## 🎯 Agent Usage Patterns

### Pattern 1: Simple Voice Response

```javascript
async function respondWithVoice(text) {
  const memo = await fetch('https://api-agent-memo.onrender.com/memo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: 'june' })
  }).then(r => r.json());
  
  return {
    text: text,
    audioUrl: memo.audio.url,
    message: "Click to hear"
  };
}
```

### Pattern 2: Context-Aware Voice Selection

```javascript
// Select voice based on context
function selectVoiceForContext(context) {
  const voiceMap = {
    'greeting': 'june',
    'error': 'fred',
    'success': 'bella',
    'instruction': 'marcus',
    'casual': 'april',
    'formal': 'sally'
  };
  
  return voiceMap[context] || 'june';
}

async function contextualResponse(text, context) {
  const voice = selectVoiceForContext(context);
  return await respondWithVoice(text, voice);
}
```

### Pattern 3: Batch Message Generation

```javascript
// Generate multiple messages in parallel
async function generateBatch(messages) {
  const results = await Promise.all(
    messages.map(msg =>
      fetch('https://api-agent-memo.onrender.com/memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      }).then(r => r.json())
    )
  );
  
  return results;
}

// Usage
const batch = await generateBatch([
  { text: "Welcome!", voice: "june" },
  { text: "Here's your task.", voice: "fred" },
  { text: "Good luck!", voice: "sally" }
]);
```

### Pattern 4: Memo Reuse (Same Message, Multiple Users)

```javascript
// Generate once, share across users
const sharedWelcomeMemo = await fetch('.../memo', { ...body: { text: "Welcome!", voice: "june" } });

// All users get same audio URL
function sendWelcomeToUser(userId) {
  return {
    userId,
    audioUrl: sharedWelcomeMemo.audio.url
  };
}
```

---

## ❌ Error Handling

### Common Errors

| HTTP Code | Error | Cause | Solution |
|-----------|-------|-------|----------|
| 400 | Invalid input | Missing or invalid `text` or `voice` | Check request format |
| 400 | Invalid voice | Voice ID not recognized | Use GET /voices to get valid list |
| 500 | Failed to create memo | ElevenLabs API error | Retry with exponential backoff |
| 404 | Memo not found | Invalid memo ID | Check ID or recreate memo |
| 503 | Service unavailable | TTS service down | Retry later |

### Retry Strategy

```javascript
async function createMemoWithRetry(text, voice, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createMemo(text, voice);
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

---

## 📊 Best Practices

### 1. Choose Appropriate Voices

- **Welcome messages:** Use warm voices (Bella, June)
- **Errors/Alerts:** Use authoritative voices (Fred, Bill)
- **Instructions:** Use professional voices (Sally, Marcus)
- **Casual chat:** Use friendly voices (April, Charlie, Dora)

### 2. Keep Text Concise

- **Optimal:** 50-200 words
- **Maximum:** ~5000 characters (ElevenLabs limit)
- **Tip:** Split long messages into multiple segments

### 3. Cache Common Messages

```javascript
// Cache frequently used greetings, confirmations, etc.
const commonMessages = {
  welcome: null,
  confirm: null,
  success: null
};

// Initialize on startup
await prefetchCommonMessages();
```

### 4. Provide Text + Audio

Always provide both text and audio URL:

```javascript
{
  text: "Your order is ready!",
  audioUrl: "https://.../audio/memo_abc.mp3",
  transcript: "Your order is ready!"  // Accessibility
}
```

### 5. Handle Audio Playback

```html
<!-- Best practice: Provide both audio and text -->
<div class="agent-message">
  <p class="text">Your order is ready!</p>
  <audio controls>
    <source src="${audioUrl}" type="audio/mpeg">
    <a href="${audioUrl}">Download audio</a>
  </audio>
</div>
```

---

## 🔗 Integration Examples

### Example 1: Chatbot Integration

```javascript
class Chatbot {
  constructor() {
    this.memoApi = 'https://api-agent-memo.onrender.com';
  }
  
  async sendMessage(text, context = 'general') {
    // Generate audio
    const memo = await this.generateVoice(text, context);
    
    // Return message with audio
    return {
      type: 'voice',
      text: text,
      audioUrl: memo.audio.url,
      metadata: { context }
    };
  }
  
  async generateVoice(text, context) {
    const voice = this.selectVoice(context);
    const response = await fetch(`${this.memoApi}/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice })
    });
    return await response.json();
  }
  
  selectVoice(context) {
    // Context-aware voice selection
    const voices = {
      greeting: 'bella',
      help: 'june',
      error: 'fred',
      success: 'charlie'
    };
    return voices[context] || 'june';
  }
}
```

### Example 2: Task Assistant

```javascript
class TaskAssistant {
  async assignTask(task, user) {
    // Generate task assignment audio
    const assignment = await this.createMemo(
      `New task assigned: ${task.name}. Priority: ${task.priority}. Due date: ${task.dueDate}`,
      'bill'
    );
    
    // Notify user
    await this.notifyUser(user, {
      task: task,
      audioUrl: assignment.audio.url
    });
  }
  
  async completeTask(task) {
    // Generate completion audio
    const completion = await this.createMemo(
      `Task "${task.name}" completed successfully! Great work!`,
      'bella'
    );
    
    return completion.audio.url;
  }
}
```

---

## 📈 Monitoring & Metrics

### Recommended Metrics to Track

1. **Memo Generation Rate** - Requests per second
2. **Average Generation Time** - Time from request to response
3. **Error Rate** - Failed / Total requests
4. **Voice Usage Distribution** - Which voices are used most
5. **Cache Hit Rate** - If caching is implemented

### Logging Format

```json
{
  "timestamp": "2026-02-13T14:30:00Z",
  "event": "memo_created",
  "agent_id": "agent_123",
  "voice": "june",
  "text_length": 150,
  "audio_size_bytes": 18432,
  "generation_time_ms": 1200,
  "status": "success"
}
```

---

## 🔧 Configuration

### Environment Variables (for Agent)

```javascript
const AGENT_MEMO_CONFIG = {
  baseUrl: process.env.AGENT_MEMO_URL || 'https://api-agent-memo.onrender.com',
  defaultVoice: process.env.AGENT_MEMO_DEFAULT_VOICE || 'june',
  timeout: parseInt(process.env.AGENT_MEMO_TIMEOUT) || 10000,
  retryAttempts: parseInt(process.env.AGENT_MEMO_RETRY) || 3
};
```

---

## 📄 License

MIT License

---

## 📞 Support

- **GitHub:** https://github.com/twilson63/agent-memo
- **Documentation:** https://github.com/twilson63/agent-memo/README.md

---

**This A2A specification enables seamless agent-to-agent communication with the Agent Memo service!**