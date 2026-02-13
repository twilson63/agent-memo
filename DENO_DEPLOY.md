# Deno Deploy Setup Guide

This guide explains how to deploy Agent Memo to Deno Deploy.

---

## 🚀 Quick Start

### Option 1: Automatic Deployment with GitHub Actions (Recommended)

If you have `DENO_DEPLOY_TOKEN` in GitHub secrets, the workflow will automatically deploy on every push to `main`.

```bash
# Just push to main branch
git add agent-memo/
git commit -m "Add Deno Deploy support"
git push origin main
```

### Option 2: Manual Deployment

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Deploy
cd agent-memo
deno deploy --project=agent-memo --token=YOUR_TOKEN server.ts
```

---

## 🔑 Required Environment Variables

### For Deno Deploy (Add Project Settings):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TTS_MODE` | No | `simulation` | TTS provider: `simulation`, `edge`, or `elevenlabs` |
| `ELEVENLABS_API_KEY` | No | - | ElevenLabs API key (required if `TTS_MODE=elevenlabs`) |
| `BASE_URL` | No | Auto-generated | API base URL (usually auto-detected) |

### For GitHub Actions:

| Secret | Required | Description |
|--------|----------|-------------|
| `DENO_DEPLOY_TOKEN` | Yes | Your Deno Deploy personal access token |
| `DENO_PROJECT_ID` | No | Project ID (or uses `agent-memo`) |
| `ELEVENLABS_API_KEY` | No | Optional Deploy with ElevenLabs support |

---

## 📋 Setup Steps

### Step 1: Get Deno Deploy Token

1. Go to https://dash.deno.com/account
2. Click "New Token"
3. Generate a token (e.g., "Agent Memo Deploy")
4. Copy the token

### Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `DENO_DEPLOY_TOKEN`
5. Value: Your Deno Deploy token
6. Click "Add secret"

### Step 3: (Optional) Set Project ID

If you already have a Deno Deploy project:

1. Go to https://dash.deno.com
2. Copy your project ID
3. Add `DENO_PROJECT_ID` secret to GitHub

### Step 4: Push to Deploy

```bash
git add .
git commit -m "Deploy Agent Memo to Deno Deploy"
git push origin main
```

The workflow will automatically deploy to Deno Deploy!

---

## 🧪 Testing Locally

Before deploying, test locally:

```bash
cd agent-memo

# Run with simulation mode (no API key needed)
deno run --allow-net --allow-env server.ts

# Run with ElevenLabs
ELEVENLABS_API_KEY=sk_xxx deno run --allow-net --allow-env server.ts

# Test in another terminal
curl http://localhost:8000/health
```

---

## 🔧 GitHub Actions Workflow

The workflow `.github/workflows/deploy-deno.yml`:

1. **Runs on:** Push to `main` branch
2. **Triggers:** When `agent-memo/**` files change
3. **Type checking:** Verifies TypeScript before deploying
4. **Deployment:** Deploys to Deno Deploy
5. **Health check:** Verifies deployment succeeded
6. **PR comments:** Comments on PRs with deployment URL

---

## 📊 Differences: Node.js vs Deno Deploy

### Node.js Version (Current)

| Feature | Status |
|---------|--------|
| Storage | Local file system (`/storage/`) |
| Persistence | ✅ Yes |
| Cache | ❌ No |
| Mode | Development or self-hosted |
| Audio expiration | Manual |

### Deno Deploy Version

| Feature | Status |
|---------|--------|
| Storage | Cache API (automated) |
| Persistence | ❌ No (ephemeral) |
| Cache | ✅ Yes (built-in, 10-min TTL) |
| Mode | Serverless, edge deployment |
| Audio expiration | ✅ Automatic after 10 minutes |

### API Differences

| Endpoint | Node.js | Deno Deploy |
|----------|---------|-------------|
| `GET /health` | ✅ Working | ✅ Working |
| `GET /voices` | ✅ Working | ✅ Working |
| `POST /memo` | ✅ Working | ✅ Working |
| `GET /memo/:id` | ✅ Working | ❌ Not supported |
| `GET /memos` | ✅ Working | ❌ Not supported |
| `DELETE /memo/:id` | ✅ Working | ❌ Not supported |

**Why?** Deno Deploy is serverless and doesn't have persistent storage. Audio files are cached for 10 minutes in the Cache API but not persisted to a database.

---

## 🎯 Usage Examples

### Create a Memo

```bash
curl -X POST https://agent-memo.deno.dev/memo \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello from Deno Deploy!",
    "voice": "june"
  }'
```

Response:
```json
{
  "id": "abc123",
  "text": "Hello from Deno Deploy!",
  "voice": {"id": "june", "name": "June"},
  "audio": {
    "filename": "memo_abc123.mp3",
    "url": "https://agent-memo.deno.dev/audio/memo_abc123.mp3",
    "length": 226375,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T18:24:12.321Z"
}
```

### Get Audio

```bash
# Use the audio URL from the response
curl https://agent-memo.deno.dev/audio/memo_abc123.mp3 --output audio.mp3

# Or open in browser
open https://agent-memo.deno.dev/audio/memo_abc123.mp3
```

### Audio Cache Behavior

- **First request:** Generates audio, caches for 10 minutes
- **Within 10 min:** Returns cached audio instantly (fast!)
- **After 10 min:** Cache expires, generates again

---

## 🔍 Troubleshooting

### Issue: "DENO_DEPLOY_TOKEN not set"

**Solution:** Add `DENO_DEPLOY_TOKEN` to GitHub Secrets

### Issue: "Project not found"

**Solution:**
1. Project name must exist in Deno Deploy
2. Check project ID in Deno Dashboard
3. Or let the workflow create it automatically

### Issue: "ELEVENLABS_API_KEY not configured"

**Solution:**
1. Either add `.env=ELEVENLABS_API_KEY` to GitHub Actions (not recommended)
2. Or keep `TTS_MODE=simulation` (default, free)
3. Or add `ELEVENLABS_API_KEY` to GitHub Secrets for auto-deployment

### Issue: Type check fails

**Solution:**
```bash
deno check server.ts
deno check memo-service.ts
```

---

## 📝 Environment Variables

### Set in Deno Deploy Dashboard

1. Go to https://dash.deno.com
2. Select your project
3. Settings → Environment Variables
4. Add variables:
   - `TTS_MODE=simulation` (or `elevenlabs`)
   - `ELEVENLABS_API_KEY=sk_xxx` (if using ElevenLabs)

### Set in GitHub Actions (for auto-deploy)

1. GitHub → Settings → Secrets and variables → Actions
2. Add secrets:
   - `DENO_DEPLOY_TOKEN` (required)
   - `DENO_PROJECT_ID` (optional)
   - `ELEVENLABS_API_KEY` (optional)

---

## 🚀 Production Checks

Before going to production:

- [ ] ✅ TypeScript compiles without errors
- [ ] ✅ Health endpoint returns 200 OK
- [ ] ✅ Audio generation works
- [ ] ✅ Cache API is working (check logs)
- [ ] ✅ ElevenLabs API key works (if using)
- [ ] ✅ Monitor cache hit rates
- [ ] ✅ Set up monitoring/alerts

---

## 📚 Resources

- [Deno Deploy Documentation](https://docs.deno.com/deploy/)
- [Deno Deploy Cache API](https://deno.com/blog/deploy-cache-api)
- [Deno Deploy CLI](https://docs.deno.com/manual/tools/deno_deploy)
- [GitHub Actions for Deno](https://deno.com/deploy/github_actions)

---

## 💡 Tips

1. **Start with simulation mode** - No API key needed
2. **Use Edge TTS for free real audio** - Good quality, no cost
3. **ElevenLabs for production** - Best quality, requires API key
4. **Monitor cache hit rate** - Higher = better performance
5. **GitHub Actions auto-deploy** - Easiest for continuous deployment

---

## 🎉 Success!

Your Agent Memo API is now running on Deno Deploy!

Check the status:
```bash
curl https://agent-memo.deno.dev/health
```

Create your first memo:
```bash
curl -X POST https://agent-memo.deno.dev/memo \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello!", "voice":"june"}'
```

🚀 Happy deploying!# Deno Deploy Ready
# Deployment trigger for new token
