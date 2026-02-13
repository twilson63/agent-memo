# 🎙️ Agent Memo API

> REST API for AI agents to convert text to audio using text-to-speech

---

## 📖 Overview

**Agent Memo** is a REST API that allows AI agents to convert text to speech using multiple TTS providers. It's designed for agent-to-agent (A2A) communication, enabling AI assistants to "speak" to users or other agents via audio.

---

## 🚀 Quick Start

### Base URL

```
https://agent-memo.onrender.com
```

### Create Your First Memo

```bash
curl -X POST https://agent-memo.onrender.com/memo \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! This is Agent Memo working.",
    "voice": "rachel"
  }'
```

**Response:**

```json
{
  "id": "abc123",
  "text": "Hello! This is Agent Memo working.",
  "voice": {"id": "rachel", "name": "Rachel"},
  "audio": {
    "filename": "memo_abc123.mp3",
    "url": "https://agent-memo.onrender.com/audio/memo_abc123.mp3",
    "length": 29301,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T20:00:00.000Z"
}
```

---

## 🎤 Available Voices

| Voice ID | Name | Gender | Description |
|----------|------|--------|-------------|
| `rachel` | Rachel | Female | Young, American, calm narration |
| `domi` | Domi | Female | Strong, professional narration |
| `sarah` | Sarah | Female | Soft news presenter |
| `emily` | Emily | Female | Calm meditation guide |
| `freya` | Freya | Female | Young, American |
| `dorothy` | Dorothy | Female | British, children's stories |
| `adam` | Adam | Male | Deep narration voice |
| `bill` | Bill | Male | Strong documentary voice |
| `charlie` | Charlie | Male | Australian, casual conversational |
| `ethan` | Ethan | Male | ASMR, soft-spoken |

---

## 📚 API Endpoints

### 1. Health Check

**GET** `/health`

Check if the service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "Agent Memo",
  "version": "1.0.0",
  "timestamp": "2026-02-13T20:00:00.000Z"
}
```

---

### 2. List Voices

**GET** `/voices`

Get all available voices.

**Response:**
```json
{
  "voices": [
    {"id": "june", "name": "June", "gender": "female"},
    {"id": "april", "name": "April", "gender": "female"}
    // ... all voices
  ]
}
```

---

### 3. Create Memo

**POST** `/memo`

Convert text to audio.

**Request Body:**
```json
{
  "text": "Your text here (max 5000 characters)",
  "voice": "rachel"
}
```

**Fields:**
- `text` (string, required): Text to convert to speech
- `voice` (string, required): Voice ID (see Available Voices above)

**Response:**
```json
{
  "id": "abc123",
  "text": "Your text here",
  "voice": {"id": "rachel", "name": "Rachel"},
  "audio": {
    "filename": "memo_abc123.mp3",
    "url": "https://agent-memo.onrender.com/audio/memo_abc123.mp3",
    "length": 29301,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T20:00:00.000Z"
}
```

---

### 4. Get Memo by ID

**GET** `/memo/:memoId`

Retrieve memo details by ID.

**Response:** (same as Create Memo response)

---

### 5. List All Memos

**GET** `/memos?limit=20&offset=0`

List all memos with pagination.

**Query Parameters:**
- `limit` (number, optional): Number of memos to return (default: 20)
- `offset` (number, optional): Number of memos to skip (default: 0)

**Response:**
```json
{
  "memos": [/* array of memo objects */],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 6. Delete Memo

**DELETE** `/memo/:memoId`

Delete a memo by ID.

**Response:**
```json
{
  "success": true,
  "message": "Memo deleted successfully"
}
```

---

## 🎧 Audio Files

Audio files are served from:

```
/audio/memo_abc123.mp3
```

You can:
- **Play in browser**: Open the audio URL directly
- **Download**: Use the audio URL in `curl` or `wget`
- **Embed**: Use in `<audio>` tags in HTML

---

## 🤖 Agent Integration

### Example: Chatbot Voice Response

```javascript
const response = await fetch('https://agent-memo.onrender.com/memo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "I found 5 results for your search.",
    voice: "june"
  })
});

const memo = await response.json();

// Play audio in browser
new Audio(memo.audio.url).play();

// Or send to user
console.log(`Audio: ${memo.audio.url}`);
```

---

### Example: Voice-Enabled Task Assistant

```python
import requests

def announce_task_completion(task_name, voice="june"):
    response = requests.post(
        'https://agent-memo.onrender.com/memo',
        json={
            'text': f'Task {task_name} has been completed!',
            'voice': voice
        }
    )
    return response.json['audio']['url']
```

---

## 🔧 Configuration

The service supports multiple TTS modes via the `TTS_MODE` environment variable:

| Mode | Description | API Key Required? |
|------|-------------|-------------------|
| `simulation` | Returns valid MP3 file (silent/minimal) | No |
| `edge` | Microsoft Edge Read Aloud (free, high quality) | No |
| `elevenlabs` | ElevenLabs production TTS | Yes |

**Default:** `elevenlabs`

---

## 📊 Rate Limits

- **No explicit rate limits** (for now)
- Audio files stored for 10 minutes (after creation)
- Large texts may take longer to process

---

## 🛠️ Development

### Local Development

```bash
# Clone repository
git clone https://github.com/twilson63/agent-memo.git
cd agent-memo

# Install dependencies
npm install

# Start local server
npm run dev

# Test
curl http://localhost:3000/health
```

---

### Testing

```bash
# Run tests
npm test
```

---

## 📄 License

MIT License - see [LICENSE](https://github.com/twilson63/agent-memo/blob/main/LICENSE) for details

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

## 📞 Support

- GitHub: [https://github.com/twilson63/agent-memo](https://github.com/twilson63/agent-memo)
- Issues: [https://github.com/twilson63/agent-memo/issues](https://github.com/twilson63/agent-memo/issues)

---

## 🎯 Use Cases

- **Voice-enabled chatbots**: Speak responses to users
- **Accessibility**: Convert text to audio for screen readers
- **Agent communication**: Send voice messages between AI agents
- **Multimodal interfaces**: Combine text, audio, and video
- **Voice notifications**: Alert users with spoken messages

---

## 🌟 Features

- ✅ **Multiple voices**: 9 voices across different tones
- ✅ **Multiple TTS providers**: Switch between simulation, Edge, ElevenLabs
- ✅ **Agent-first design**: REST API optimized for AI agents
- ✅ **Simple integration**: One POST request to generate audio
- ✅ **Automatic URL generation**: No manual file management
- ✅ **Cross-platform**: Works with any HTTP client

---

Made with ❤️ for AI agents

---

**Version:** 1.0.0
**Last Updated:** 2026-02-13