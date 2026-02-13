#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MemoService } from './lib/memo-service.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const memoService = new MemoService();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static audio files
app.use('/audio', express.static(join(__dirname, 'storage')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Agent Memo',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// List available voices
app.get('/voices', (req, res) => {
  res.json({
    voices: memoService.getAvailableVoices()
  });
});

// Get memo by ID
app.get('/memo/:memoId', (req, res) => {
  try {
    const { memoId } = req.params;
    const memo = memoService.getMemo(memoId);
    
    if (!memo) {
      return res.status(404).json({
        error: 'Memo not found',
        memoId
      });
    }
    
    res.json(memo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert text to audio (POST)
app.post('/memo', async (req, res) => {
  try {
    const { text, voice } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input: text is required and must be a string'
      });
    }

    if (!voice || typeof voice !== 'string') {
      return res.status(400).json({
        error: 'Invalid input: voice is required and must be a string'
      });
    }

    // Validate voice
    if (!memoService.isValidVoice(voice)) {
      return res.status(400).json({
        error: 'Invalid voice',
        availableVoices: memoService.getAvailableVoices(),
        requestedVoice: voice
      });
    }

    // Generate memo
    const memo = await memoService.createMemo(text, voice);

    res.status(201).json(memo);
  } catch (error) {
    console.error('Error creating memo:', error);
    res.status(500).json({
      error: 'Failed to create memo',
      message: error.message
    });
  }
});

// List all memos (with pagination)
app.get('/memos', (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const memos = memoService.listMemos({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(memos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete memo
app.delete('/memo/:memoId', (req, res) => {
  try {
    const { memoId } = req.params;
    const deleted = memoService.deleteMemo(memoId);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Memo not found',
        memoId
      });
    }
    
    res.json({ message: 'Memo deleted', memoId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  const ttsMode = memoService.getTTSMode();
  const ttsLabels = {
    'simulation': '🎭 Simulation (mock)',
    'edge': '🌐 Microsoft Edge TTS (free)',
    'elevenlabs': '🔊 ElevenLabs (API key required)'
  };

  console.log(`
╔═════════════════════════════════════════════════════════╗
║           🎙️  Agent Memo API - Running!               ║
╚═════════════════════════════════════════════════════════╝
  
  📍 API:  http://localhost:${PORT}
  🔊 TTS:  ${ttsLabels[ttsMode] || ttsMode}
  📚 Docs: http://localhost:${PORT}/health
  
  Available Voices:
  ${memoService.getAvailableVoices().map(v => `    • ${v.name} (${v.gender})`).join('\n')}
  
  💡 Testing without API key?
      • Set TTS_MODE=simulation (mock)
      • Set TTS_MODE=edge (real audio, free)
      • See TESTING-GUIDE.md for details
  
`);
});

export default app;