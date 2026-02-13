# 🎙️ Agent Memo API

A REST API that allows AI agents to convert text to audio using ElevenLabs text-to-speech, store the audio, and return a URL for playback.

## 📋 Overview

Agent Memo provides a simple API for agents to:
1. Send text and voice selection as JSON
2. Generate high-quality audio using ElevenLabs TTS
3. Store the audio file
4. Return a URL for the agent to display/play

This enables agents to communicate with users through voice playback, making interactions more engaging and accessible.

**Use Case:** An agent can convert its text response to audio and provide a clickable link for users to hear the message.

---

## 🚀 Quick Start

### Option 1: Deno Deploy (Serverless, 10-min cache) ⭐

Deploy to Deno Deploy with zero configuration:

```bash
# 1. Add DENO_DEPLOY_TOKEN to GitHub Secrets
# 2. Push to main branch - auto-deploys!

# Or deploy manually
cd agent-memo
./deploy.sh  # or: DENO_DEPLOY_TOKEN=xxx deno deploy server.ts
```

**See [DENO_DEPLOY.md](./DENO_DEPLOY.md) for full setup guide.**

### Option 2: Node.js/Express (Self-hosted, persistent storage)

```bash
git clone https://github.com/twilson63/agent-memo.git
cd agent-memo
npm install
```

### 2. Get ElevenLabs API Key

- Go to https://elevenlabs.io
- Sign up for an account
- Navigate to Settings → API Keys
- Copy your API key

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your ElevenLabs API key
```

Edit `.env`:

```env
ELEVENLABS_API_KEY=your_actual_api_key_here
PORT=3000
BASE_URL=http://localhost:3000
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

---

## 🎤 Available Voices

| Voice ID | Name | Gender | ElevenLabs ID |
|----------|------|--------|---------------|
| `june` | June | Female | 21m00Tcm4TlvDq8ikWAM |
| `april` | April | Female | AZnzlk1XvdvUeBnXmlld |
| `sally` | Sally | Female | EXAVITQu4TlvDq8ikWAM |
| `fred` | Fred | Male | TxGEqnHWrfWFTfGW9XjX |
| `bill` | Bill | Male | flq6f7yk4E4fJM5XTYuZ |
| `charlie` | Charlie | Male | IKne3meq4xnSDxMaLd |
| `dora` | Dora | Female | pNInz6obpgDQGcFmaJgB |
| `marcus` | Marcus | Male | wVAW6Ij4fQ3QmWYc4JyO |
| `bella` | Bella | Female | XB0fDKeXKc1Xb2dQw7Jc |

---

## 📡 API Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "service": "Agent Memo",
  "version": "1.0.0",
  "timestamp": "2026-02-13T14:30:00.000Z"
}
```

---

### List Available Voices

```http
GET /voices
```

**Response:**

```json
{
  "voices": [
    {
      "id": "june",
      "name": "June",
      "gender": "female"
    },
    {
      "id": "april",
      "name": "April",
      "gender": "female"
    }
  ]
}
```

---

### Create Memo (Text to Audio)

```http
POST /memo
Content-Type: application/json

{
  "text": "Hello! This is a test of the Agent Memo service.",
  "voice": "june"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | ✅ Yes | Text to convert to audio |
| `voice` | string | ✅ Yes | Voice to use (see available voices) |

**Response (201 Created):**

```json
{
  "id": "a1b2c3d4e5f6",
  "text": "Hello! This is a test of the Agent Memo service.",
  "voice": {
    "id": "june",
    "name": "June"
  },
  "audio": {
    "filename": "memo_a1b2c3d4e5f6.mp3",
    "url": "http://localhost:3000/audio/memo_a1b2c3d4e5f6.mp3",
    "length": 24562,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T14:30:00.000Z"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/memo \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Agent Memo! This is an example of text-to-speech.",
    "voice": "june"
  }'
```

---

### Get Memo by ID

```http
GET /memo/:memoId
```

**Response (200 OK):**

```json
{
  "id": "a1b2c3d4e5f6",
  "text": "Hello! This is a test of the Agent Memo service.",
  "voice": {
    "id": "june",
    "name": "June"
  },
  "audio": {
    "filename": "memo_a1b2c3d4e5f6.mp3",
    "url": "http://localhost:3000/audio/memo_a1b2c3d4e5f6.mp3",
    "length": 24562,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T14:30:00.000Z"
}
```

**Note for Deno Deploy:**
- Audio files are **automatically cached for 10 minutes**
- Return the `audio.url` response - it works immediately and for 10 minutes
- After 10 minutes, the audio expires from cache
- No manual cleanup needed!
- GET `/memo/:id`, GET `/memos`, and DELETE `/memo/:id` are not supported (no persistence)

**Response (404 Not Found):**

```json
{
  "error": "Memo not found",
  "memoId": "invalid-id"
}
```

---

### List All Memos

```http
GET /memos?limit=20&offset=0
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of memos to return |
| `offset` | integer | 0 | Number of memos to skip |

**Response:**

```json
{
  "memos": [
    {
      "id": "a1b2c3d4e5f6",
      "text": "Hello! This is a test.",
      "voice": { "id": "june", "name": "June" },
      "audio": {
        "filename": "memo_a1b2c3d4e5f6.mp3",
        "url": "http://localhost:3000/audio/memo_a1b2c3d4e5f6.mp3",
        "length": 24562,
        "format": "mp3"
      },
      "createdAt": "2026-02-13T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### Delete Memo

```http
DELETE /memo/:memoId
```

**Response (200 OK):**

```json
{
  "message": "Memo deleted",
  "memoId": "a1b2c3d4e5f6"
}
```

---

## 💡 Usage Examples

### Example 1: Create and Play

```javascript
// 1. Create memo
const response = await fetch('http://localhost:3000/memo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Hello! I'm your AI assistant. How can I help you today?",
    voice: "june"
  })
});

const memo = await response.json();
console.log('Audio URL:', memo.audio.url);

// 2. Play audio in HTML
<audio controls>
  <source src="${memo.audio.url}" type="audio/mpeg">
  Your browser does not support audio.
</audio>
```

### Example 2: Agent Integration

```javascript
// In your agent code
async function speakToUser(text, voice = "june") {
  // Convert text to audio
  const response = await fetch('http://localhost:3000/memo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice })
  });
  
  const memo = await response.json();
  
  // Return both text and audio URL
  return {
    text: text,
    audioUrl: memo.audio.url,
    playMessage: "Click to hear the message"
  };
}

// Usage
const result = await speakToUser(
  "Here's your daily summary. You have 5 new messages.",
  "fred"
);

console.log(result.text);        // Text for display
console.log(result.audioUrl);    // URL for audio player
```

### Example 3: Batch Processing

```javascript
// Convert multiple messages
const messages = [
  { text: "Welcome!", voice: "june" },
  { text: "Here's your first task.", voice: "fred" },
  { text: "Good luck!", voice: "sally" }
];

const memos = await Promise.all(
  messages.map(msg => 
    fetch('http://localhost:3000/memo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    }).then(r => r.json())
  )
);

// All memos created with audio URLs
console.log(memos.map(m => m.audio.url));
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Agent                              │
│                                                         │
│  const result = await speakToUser("Hello", "june");     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ POST /memo { text, voice }
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Agent Memo API                             │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────┐       │
│  │         Express.js REST API                  │       │
│  └─────────────────────────────────────────────┘       │
│                    ↓                                     │
│  ┌─────────────────────────────────────────────┐       │
│  │         MemoService                          │       │
│  │  • Validate input                           │       │
│  │  • Call ElevenLabs API                      │       │
│  │  • Save audio file                          │       │
│  └─────────────────────────────────────────────┘       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ API Call
                   ▼
┌─────────────────────────────────────────────────────────┐
│              ElevenLabs API                             │
│           (Text-to-Speech)                              │
│                                                         │
│  POST /text-to-speech/{voice_id}                        │
│  → Returns MP3 audio buffer                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Audio file
                   ▼
┌─────────────────────────────────────────────────────────┐
│           Local Storage (storage/)                      │
│      memo_a1b2c3d4e5f6.mp3                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Return URL
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Agent Response                             │
│  {                                                      │
│    text: "Hello",                                      │
│    audioUrl: "http://.../audio/memo_...mp3"            │
│  }                                                      │
│                                                         │
│  User clicks → Audio plays! 🎵                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `ELEVENLABS_API_KEY` | ✅ Yes | - | Your ElevenLabs API key |
| `ELEVENLABS_API_BASE_URL` | No | https://api.elevenlabs.io/v1 | ElevenLabs API base URL |
| `BASE_URL` | No | http://localhost:3000 | Base URL for audio file links |
| `NODE_ENV` | No | development | Node environment (development/production) |

---

## 🧪 Testing

```bash
# Test all endpoints
npm test
```

**Test script:**

```javascript
// test.mjs
import { testHealthCheck, testCreateMemo, testGetMemo } from './tests/test-api.mjs';

async function runTests() {
  await testHealthCheck();
  await testCreateMemo();
  await testGetMemo();
}

runTests();
```

---

## 🚢 Production Deployment

### Deploy to Render

```bash
# 1. Set environment variables in Render dashboard:
#    - ELEVENLABS_API_KEY
#    - PORT (default: 10000)
#    - BASE_URL (your-render-app-url)

# 2. Deploy via GitHub integration
#    Connect repo to Render → Deploy

# 3. Update BASE_URL to your Render URL:
#    https://your-app.onrender.com
```

### Deploy to Railway

```bash
railway up
# Set ELEVENLABS_API_KEY in Railway dashboard
```

---

## 📝 Project Structure

```
agent-memo/
├── Node.js version (Express)
│   ├── index.mjs              # Main Express server
│   ├── lib/
│   │   └── memo-service.mjs   # Memo business logic & ElevenLabs integration
│   ├── storage/               # Audio file storage
│   ├── tests/
│   │   └── test-api.mjs       # API tests
│   ├── .env.example           # Environment template
│   ├── package.json           # Dependencies
│
├── Deno Deploy version (TypeScript)
│   ├── server.ts              # Deno server (Deno.serve())
│   ├── memo-service.ts        # Memo service with Cache API
│   ├── types.ts               # TypeScript definitions
│   ├── deno.json              # Deno configuration
│   ├── deploy.sh              # Manual deployment script
│   ├── DENO_DEPLOY.md         # Deployment guide
│
├── Shared docs
│   ├── README.md              # Main documentation
│   ├── SKILL.md               # OpenCode skill definition
│   ├── A2A-SPECIFICATION.md   # Agent-to-agent API spec
│   ├── PROJECT_SUMMARY.md     # Project overview
│   ├── INTEGRATION_DOCS_SUMMARY.md
│   └── TESTING-GUIDE.md       # Testing without API key
│
└── .github/workflows/
    └── deploy-deno.yml        # GitHub Actions for auto-deploy
```

---

## 🚀 Deployment

### Deno Deploy (Recommended)

✅ **Serverless deployment**
✅ **10-minute audio cache** (automatic)
✅ **No persistence needed** - Cache API handles storage
✅ **Auto-deploy via GitHub Actions**
✅ **Free during beta**

```bash
# GitHub Actions (automatic on push to main)
git push origin main

# Manual deployment
cd agent-memo
DENO_DEPLOY_TOKEN=xxx ./deploy.sh
```

**See [DENO_DEPLOY.md](./DENO_DEPLOY.md) for full guide.**

### Node.js/Express (Self-hosted)

⚠️ Requires persistent file storage
⚠️ Manual file cleanup
✅ Full API feature support
✅ Memo persistence

```bash
# Use Docker for containerization
docker build -t agent-memo .
docker run -p 3000:3000 \
  -e ELEVENLABS_API_KEY=your_key \
  agent-memo

# Or use traditional hosting (Render, Railway, etc.)
# Add ELEVENLABS_API_KEY to environment variables
```

### Comparison

| Feature | Deno Deploy | Node.js/Express |
|---------|-------------|-----------------|
| **Deployment** | Serverless | Self-hosted |
| **Persistence** | ❌ Cache (10 min) | ✅ File system |
| **GET /memo/:id** | ❌ Not supported | ✅ Yes |
| **GET /memos** | ❌ Not supported | ✅ Yes |
| **DELETE /memo** | ❌ Not supported | ✅ Yes |
| **Maintenance** | None | Manual cleanup |
| **Cost** | Free (beta) | Server costs |
| **Use case** | Simple TTS API | Full-featured app |

---

## 🔧 Development

### Adding New Voices

Edit `lib/memo-service.mjs`:

```javascript
this.voices = {
  // Add new voice
  yourVoice: { 
    name: 'Your Voice', 
    id: 'elevenlabs_voice_id', // Get from ElevenLabs
    gender: 'male'
  },
  // ... other voices
};
```

### Custom Voice Settings

Modify the `voice_settings` in `generateAudio()` method:

```javascript
voice_settings: {
  stability: 0.5,        // Lower = more expressive
  similarity_boost: 0.75, // Higher = more like original
  style: 0,              // 0-1
  use_speaker_boost: true
}
```

---

## 📊 API Rate Limits

### ElevenLabs

Check your [ElevenLabs plan](https://elevenlabs.io/pricing) for limits.

### Agent Memo

Currently no rate limiting (optional to add in future).

---

## 🔐 Security

- **API Key Security:** Never commit `.env` file
- **CORS:** Configure for production domains
- **Input Validation:** All inputs are validated
- **File Size:** Consider adding size limits for large text

---

## 🐛 Troubleshooting

### Error: "ELEVENLABS_API_KEY not configured"

```bash
# Make sure .env file exists with API key
echo "ELEVENLABS_API_KEY=your_key_here" > .env
```

### Error: "Unknown voice: xyz"

```bash
# Check available voices
curl http://localhost:3000/voices
```

### Audio not playing

```bash
# Check storage directory exists
ls -la storage/

# Check file permissions
chmod 755 storage/
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- **ElevenLabs** - Text-to-speech API
- **Express.js** - Web framework
- **Node.js** - Runtime

---

## 📧 Contact

Author: twilson63

---

**Transform text into voice for AI agents!** 🎙️✨