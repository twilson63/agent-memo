# Testing Agent Memo Without ElevenLabs API Key

## 🧪 Three Testing Options

---

## Option 1: Simulation Mode (Easiest)

No TTS service required - returns mock audio for testing service logic.

**Set environment:**
```bash
TTS_MODE=simulation
```

**How it works:**
- Returns a predefined audio file
- Simulates 1-3 second delay
- Validates all request parameters
- Tests complete API flow

**When to use:**
- Testing API endpoints
- Testing integration with agents
- Development without credentials

---

## Option 2: Edge TTS (Free, No Key Required)

Uses Microsoft Edge TTS - completely free, no API key needed, good quality.

**Set environment:**
```bash
TTS_MODE=edge
```

**How it works:**
- Calls Microsoft Edge Read Aloud API
- Returns real generated audio (MP3)
- 50+ voices available
- Multiple languages supported

**When to use:**
- Real audio generation for free
- Testing voice quality
- Development before getting ElevenLabs key

**Get more info:**
- GitHub: https://github.com/rany2/edge-tts
- No signup required
- No API key required
- Completely free

---

## Option 3: ElevenLabs (Production)

Requires an API key but provides the best quality.

**Set environment:**
```bash
TTS_MODE=elevenlabs
ELEVENLABS_API_KEY=your_key_here
```

---

## 📝 Getting an ElevenLabs API Key

### Step-by-Step

1. **Go to ElevenLabs:** https://elevenlabs.io

2. **Sign Up:**
   - Click "Sign Up" in top right
   - Create account with email or Google/GitHub

3. **Get Free Tier:**
   - New accounts get free credits
   - Check current limits on pricing page

4. **Navigate to API Keys:**
   - Click on your avatar (top right)
   - Select "Settings"
   - Click "API Keys" in left sidebar

5. **Create API Key:**
   - Click "Create API Key"
   - Give it a name (e.g., "Agent Memo")
   - Copy the key

6. **Add to .env:**
   ```bash
   ELEVENLABS_API_KEY=xiy8w7kqwe8... (your key here)
   ```

### Pricing Tiers (Current)

| Tier | Cost | Characters | Voices |
|------|------|------------|--------|
| **Free** | $0 | 10,000/mo | Limited voices |
| **Starter** | $5/mo | 30,000/mo | All voices |
| **Creator** | $22/mo | 100,000/mo | All voices + cloning |
| **Pro** | $99/mo | 500,000/mo | All features |

*Check https://elevenlabs.io/pricing for current pricing*

---

## 🌐 Open-Source TTS Alternatives

### 1. Edge TTS (Recommended for Testing)

**Pros:**
- ✅ Completely free
- ✅ No API key required
- ✅ Good quality voices
- ✅ Multiple languages
- ✅ Easy integration

**Cons:**
- ❌ Slightly less realistic than ElevenLabs
- ❌ Microsoft TOS applies

**Integration:**
```javascript
import { edgeTTS } from 'edge-tts';

const audio = await edgeTTS({
  text: "Hello world",
  voice: "en-US-JennyNeural"
});
```

**Project:** https://github.com/rany2/edge-tts

---

### 2. Coqui TTS

**Pros:**
- ✅ Open-source (Apache 2.0)
- ✅ Can run locally
- ✅ Model cloning support
- ✅ Multi-language

**Cons:**
- ❌ Requires GPU for good performance
- ❌ Models are large (1-10GB)
- ❌ Setup complexity

**Integration:**
```bash
pip install TTS

TTS --text "Hello world" --model_name tts_models/en/ljspeech/vits --out_path output.wav
```

**Project:** https://github.com/coqui-ai/TTS

---

### 3. Bark (by Suno)

**Pros:**
- ✅ Open-source (MIT)
- ✅ Realistic voices
- ✅ Can generate sound effects

**Cons:**
- ❌ Slow generation (10-30s)
- ❌ Requires GPU
- ❌ Large model (2GB)

**Integration:**
```bash
pip install git+https://github.com/suno-ai/bark.git

from bark import generate_audio, save_as_prompt

audio_array = generate_audio("Hello world")
```

**Project:** https://github.com/suno-ai/bark

---

### 4. Mozilla TTS

**Pros:**
- ✅ Open-source (MPL 2.0)
- ✅ Multiple models
- ✅ Good documentation

**Cons:**
- ❌ Outdated models
- ❌ Variable quality

**Project:** https://github.com/mozilla/TTS

---

### 5. Google TTS (gTTS)

**Pros:**
- ✅ Free
- ✅ Simple to use

**Cons:**
- ❌ Limited languages
- ❌ Rate limiting
- ❌ Lower quality

**Project:** https://github.com/pndurette/gTTS

---

## 🚀 Quick Start: Testing Without API Key

### Option A: Simulation Mode (Immediate)

```bash
# No setup required
cd agent-memo

# Run with simulation mode
TTS_MODE=simulation npm run dev

# Test
curl -X POST http://localhost:3000/memo \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello!","voice":"june"}'

# Returns mock URL
{
  "audio": { "url": "http://localhost:3000/audio/memo_sim...mp3" }
}
```

### Option B: Edge TTS (Real Audio, Free)

```bash
# Install edge-tts
npm install edge-tts

# Run with Edge TTS mode
TTS_MODE=edge npm run dev

# Test - returns real audio!
curl -X POST http://localhost:3000/memo \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world!","voice":"june"}'

# Returns real generated audio
{
  "audio": { "url": "http://localhost:3000/audio/memo_abc...mp3" }
}
```

---

## 📊 Comparison Matrix

| Solution | Free? | API Key | Quality | Speed | Setup |
|----------|-------|---------|---------|-------|-------|
| **Simulation** | ✅ | ❌ | N/A | Fast | ⭐ Immediate |
| **Edge TTS** | ✅ | ❌ | ⭐⭐⭐ | Fast | ⭐ Easy |
| **Google TTS** | ✅ | ❌ | ⭐⭐ | Fast | ⭐ Easy |
| **ElevenLabs** | ⚠️ | ✅ | ⭐⭐⭐⭐⭐ | Fast | ⭐ Easy |
| **Coqui TTS** | ✅ | ❌ | ⭐⭐⭐⭐ | Slow | ⭐⭐⭐ Complex |
| **Bark** | ✅ | ❌ | ⭐⭐⭐⭐ | Slow | ⭐⭐ Moderate |

---

## 💡 Recommendation

**For testing Agent Memo:**

1. **Start with Simulation Mode** - Immediate, no setup
2. **Then try Edge TTS** - Real audio, still free
3. **Finally, ElevenLabs** - Best quality for production

**For production:**

- Use ElevenLabs for best quality
- Consider Edge TTS as backup
- Implement fallback logic

---

## 🔧 Implementing Edge TTS

I'll now update the Agent Memo service to support both Simulation and Edge TTS modes for testing without an API key!

---

**Want me to implement the Edge TTS integration?**