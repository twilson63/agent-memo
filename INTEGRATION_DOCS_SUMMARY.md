# Agent-to-Agent (A2A) Specification & Skill Documentation

**Added:** February 13, 2026
**Repository:** https://github.com/twilson63/agent-memo

---

## 📋 What Was Added

Two important integration documents for Agent Memo:

1. **A2A-SPECIFICATION.md** - Complete agent-to-agent API contract
2. **SKILL.md** - OpenCode-compatible skill definition

---

## 📄 A2A-SPECIFICATION.md

**Purpose:** Defines how agents can programmatically interact with the Agent Memo service

**Size:** 14KB (~450 lines)

### Contents

#### 1. Service Overview
- What the service does
- Interaction pattern diagram
- Agent workflow

#### 2. Complete API Documentation

All 6 endpoints fully documented:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/memo` | POST | Convert text to audio |
| `/memo/:id` | GET | Get memo by ID |
| `/memos` | GET | List all memos |
| `/voices` | GET | List available voices |
| `/memo/:id` | DELETE | Delete memo |
| `/health` | GET | Health check |

Each endpoint includes:
- Request parameters
- Response format
- Example requests/responses
- Error codes

#### 3. Voice Directory

Complete table of 9 available voices with:
- Voice ID and name
- Gender
- Best for (use cases)

#### 4. Agent Usage Patterns

4 practical patterns with code:

1. **Simple Voice Response** - Basic conversion
2. **Context-Aware Voice Selection** - Smart voice picking
3. **Batch Message Generation** - Parallel processing
4. **Memo Reuse** - Cache optimization

#### 5. Error Handling

Common errors with solutions:
- Invalid input
- Invalid voice
- Failed creation
- Service unavailable

Includes retry strategy with exponential backoff.

#### 6. Best Practices

- Choose appropriate voices
- Keep text concise
- Cache common messages
- Provide text + audio
- Handle audio playback properly with HTML examples

#### 7. Integration Examples

Two complete examples:

**Example 1: Chatbot Integration**
```javascript
class Chatbot {
  async sendMessage(text, context = 'general') {
    const memo = await this.generateVoice(text, context);
    return {
      type: 'voice',
      text: text,
      audioUrl: memo.audio.url
    };
  }
}
```

**Example 2: Task Assistant**
```javascript
class TaskAssistant {
  async assignTask(task, user) {
    const assignment = await this.createMemo(
      `New task: ${task.name}. Priority: ${task.priority}`,
      'bill'
    );
    await this.notifyUser(user, { audioUrl: assignment.audio.url });
  }
}
```

#### 8. Performance & Metrics

- Generation time expectations (1-3 seconds)
- Rate limit guidelines
- Caching strategy
- Recommended metrics to track
- Logging format

---

## 📄 SKILL.md

**Purpose:** Natural language instructions for agents to use the Agent Memo service

**Size:** 11KB (~350 lines)

### Contents

#### 1. Skill Overview
- What the skill does
- Capability summary
- API version

#### 2. Voice Guide

Complete voice personality guide:

| Voice | Name | Personality | Best For |
|-------|------|-------------|----------|
| june | June | Friendly, warm | General, greetings |
| april | April | Casual, conversational | Informal chat |
| sally | Sally | Professional, clear | Instructions |
| fred | Fred | Informative, authoritative | Announcements |
| bill | Bill | Direct, firm | Commands |
| charlie | Charlie | Approachable, friendly | Help |
| dora | Dora | Enthusiastic, energetic | Promotions |
| marcus | Marcus | Professional, business | Formal |
| bella | Bella | Warm, welcoming | Welcomes |

#### 3. Natural Language Usage

**Basic:**
```
use agent memo to speak "Hello!" with voice june
```

**With different voices:**
```
use agent memo to speak "Welcome!" using voice bella
use agent memo to announce "Meeting soon" with voice fred
```

**Shorter syntax:**
```
speak "Your order is ready" with voice april
announce "Maintenance soon" with voice bill
say "Good work" with voice charlie
```

#### 4. Audio URL Presentation

Three formats for presenting audio to users:

**Markdown:**
```markdown
[Click to hear the message](AUDIO_URL)
```

**HTML:**
```html
<audio controls>
  <source src="AUDIO_URL" type="audio/mpeg">
</audio>
```

**Simple Link:**
```
🔊 Listen to message: AUDIO_URL
```

#### 5. Response Format

```json
{
  "id": "a1b2c3d4",
  "text": "The text you sent",
  "voice": { "id": "june", "name": "June" },
  "audio": {
    "url": "https://.../audio/memo_a1b2c3d4.mp3",
    "filename": "memo_a1b2c3d4.mp3",
    "length": 18432,
    "format": "mp3"
  },
  "createdAt": "2026-02-13T14:30:00.000Z"
}
```

#### 6. Voice Selection Guide

Context-based recommendations:

- **Customer Service:** june/bella (support), fred/bill (alerts)
- **Task Management:** marcus/sally (assignments), charlie/april (confirmations)
- **Education:** sally/marcus (instructions), dora/bella (encouragement)
- **Marketing:** dora (announcements), june (notifications)
- **Errors:** fred/bill (direct messages)

#### 7. Best Practices

1. Always provide text + audio
2. Keep messages concise (50-200 words optimal)
3. Choose voice contextually
4. Test audio URLs before presenting
5. Consider caching frequent messages

#### 8. Advanced Usage

```
get memo ID a1b2c3d4              # Get previous memo
list memos limit 10 offset 0      # List all memos
delete memo ID a1b2c3d4           # Delete memo
list voices                       # List available voices
```

#### 9. Example Scenarios

5 complete scenarios:

1. **Customer Service Bot** - Help request with June
2. **Task Assignment** - High priority task with Fred
3. **Welcome Message** - Warm welcome with Bella
4. **Error Handling** - Error message with Fred
5. **Success Confirmation** - Payment success with Charlie

Each shows both agent command and formatted user response.

#### 10. Error Handling

Common errors with causes and solutions:
- "Invalid input: text is required"
- "Invalid voice"
- "Failed to create memo"

#### 11. Integration Code

```javascript
class AgentMemoSkill {
  async speak(text, voice = 'june') {
    const response = await fetch(
      `${this.apiUrl}/memo`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice })
      }
    );
    return await response.json();
  }
  
  formatResponse(memo) {
    return {
      text: memo.text,
      audioUrl: memo.audio.url,
      html: `<audio controls><source src="${memo.audio.url}"></audio>`
    };
  }
}
```

---

## 📊 File Comparison

| Document | Purpose | Audience | Size | Lines |
|----------|---------|----------|------|-------|
| **A2A-SPECIFICATION.md** | API contract | Developers/Agents building integrations | 14KB | ~450 |
| **SKILL.md** | Usage instructions | AI agents (natural language) | 11KB | ~350 |
| **README.md** | General documentation | Everyone | 14KB | ~430 |
| **PROJECT_SUMMARY.md** | Project overview | Everyone | 7.7KB | ~230 |

---

## 🎯 Who Should Use Which Document?

| Audience | Use |
|----------|-----|
| **AI Agent** | Use `SKILL.md` to learn how to call the service naturally |
| **Agent Developer** | Use `A2A-SPECIFICATION.md` for programmatic integration |
| **End User** | Use `README.md` to understand what the service does |
| **Project Owner** | Use `PROJECT_SUMMARY.md` for overview |
| **Integration Developer** | Use `A2A-SPECIFICATION.md` for API details + `SKILL.md` for examples |

---

## 🔗 How They Work Together

```
┌─────────────────────────────────────────────────────┐
│              SKILL.md                                │
│         (Agent Instructions)                        │
│                                                     │
│  "use agent memo to speak 'Hello' with voice june"  │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Agent learns to call API
                 ▼
┌─────────────────────────────────────────────────────┐
│          A2A-SPECIFICATION.md                        │
│           (API Contract)                            │
│                                                     │
│  POST /memo                                         │
│  { text, voice } → { audioUrl }                     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Implementation
                 ▼
┌─────────────────────────────────────────────────────┐
│           Agent Memo API                             │
│         (Express Server)                             │
│                                                     │
│  Generates audio, stores file, returns URL          │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Repository Status

**Git History:**
```
c62e34d Add A2A specification and Agent Memo skill (latest)
a00dbfe Add project summary document
2f70813 Add usage examples for agent integration
d94b65f Initial commit: Agent Memo API v1.0
```

**Total Files:** 12
- 3 Markdown documentation files (`README.md`, `A2A-SPECIFICATION.md`, `SKILL.md`)
- 1 project summary (`PROJECT_SUMMARY.md`)
- 6 code files (`index.mjs`, `lib/memo-service.mjs`, `package.json`, etc.)
- 2 example/test files

---

## ✨ What This Enables

With these two documents, Agent Memo is now:

1. **Self-Documenting** - Complete API specification
2. **Agent-Ready** - Natural language skill definition
3. **Integration-Friendly** - Clear contract for developers
4. **Production-Ready** - Error handling, patterns, examples
5. **Stand-Alone** - Can be integrated into any agent harness

---

## 🚀 Next Steps for Integration

### For AI Agents

1. Add `SKILL.md` to your agent's knowledge base
2. Learn patterns: "use agent memo to speak X with voice Y"
3. Present audio URLs to users in HTML format

### For Agent Developers

1. Read `A2A-SPECIFICATION.md` for API details
2. Implement `AgentMemoSkill` class from examples
3. Add to your agent harness
4. Test with example scenarios

### For End Users

Simply click the audio player links presented by the agent!

---

## 📚 Documentation Index

All documentation now complete:

| File | Purpose | When to Read |
|------|---------|--------------|
| **README.md** | General overview | First time learning about Agent Memo |
| **A2A-SPECIFICATION.md** | API contract | When building integrations |
| **SKILL.md** | Agent instructions | When adding to agent harness |
| **PROJECT_SUMMARY.md** | Project overview | Quick project summary |
| **examples.mjs** | Code examples | When implementing |

---

## 🎉 Summary

✅ **A2A-SPECIFICATION.md created** - Complete API contract
✅ **SKILL.md created** - Natural language skill definition
✅ **Integration ready** - Any agent harness can now use Agent Memo
✅ **Documentation complete** - All aspects covered

**Agent Memo is now fully documented and ready for seamless agent integration!** 🎙️✨