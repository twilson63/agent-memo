import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Memo Service - Handles text-to-speech conversion using ElevenLabs
 */
export class MemoService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.apiBaseUrl = process.env.ELEVENLABS_API_BASE_URL || 'https://api.elevenlabs.io/v1';
    this.storageDir = join(__dirname, '../storage');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // Available voices
    this.voices = {
      // ElevenLabs default voices
      june: { name: 'June', id: '21m00Tcm4TlvDq8ikWAM', gender: 'female' },
      april: { name: 'April', id: 'AZnzlk1XvdvUeBnXmlld', gender: 'female' },
      sally: { name: 'Sally', id: 'EXAVITQu4vr4xnSDxMaL', gender: 'female' },
      fred: { name: 'Fred', id: 'TxGEqnHWrfWFTfGW9XjX', gender: 'male' },
      bill: { name: 'Bill', id: 'flq6f7yk4E4fJM5XTYuZ', gender: 'male' },
      // Additional premium voices
      charlie: { name: 'Charlie', id: 'IKne3meq5aSn9XLyUdCD', gender: 'male' },
      dora: { name: 'Dora', id: 'pNInz6obpgDQGcFmaJgB', gender: 'female' },
      marcus: { name: 'Marcus', id: 'wVAW6Ij4fQ3QmWYc4JyO', gender: 'male' },
      bella: { name: 'Bella', id: 'XB0fDKeXKc1Xb2dQw7Jc', gender: 'female' }
    };
    
    // In-memory memo storage (in production, use database)
    this.memos = new Map();
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return Object.keys(this.voices).map(key => ({
      id: key,
      name: this.voices[key].name,
      gender: this.voices[key].gender
    }));
  }

  /**
   * Check if voice is valid
   */
  isValidVoice(voiceId) {
    return this.voices[voiceId.toLowerCase()] !== undefined;
  }

  /**
   * Get voice ID from name
   */
  getVoiceId(voiceId) {
    const voice = this.voices[voiceId.toLowerCase()];
    return voice ? voice.id : null;
  }

  /**
   * Create a new memo (convert text to audio)
   */
  async createMemo(text, voiceName) {
    const voiceId = this.getVoiceId(voiceName);
    
    if (!voiceId) {
      throw new Error(`Unknown voice: ${voiceName}`);
    }

    console.log(`🎙️  Creating memo with voice "${voiceName}"...`);
    console.log(`📝 Text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);

    // Generate audio from text
    const audioBuffer = await this.generateAudio(text, voiceId);
    
    // Save audio file
    const filename = `memo_${this.generateId()}.mp3`;
    const audioPath = join(this.storageDir, filename);
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.writeFile(audioPath, audioBuffer);
    
    // Create memo object
    const memo = {
      id: this.generateId(),
      text: text,
      voice: {
        id: voiceName,
        name: this.voices[voiceId].name
      },
      audio: {
        filename: filename,
        url: `${this.baseUrl}/audio/${filename}`,
        length: audioBuffer.length,
        format: 'mp3'
      },
      createdAt: new Date().toISOString()
    };
    
    // Store memo
    this.memos.set(memo.id, memo);
    
    console.log(`✅ Memo created: ${memo.id}`);
    console.log(`🔗 Audio URL: ${memo.audio.url}`);
    
    return memo;
  }

  /**
   * Generate audio from text using ElevenLabs
   */
  async generateAudio(text, voiceId) {
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const url = `${this.apiBaseUrl}/text-to-speech/${voiceId}`;
    
    console.log(`🔗 Calling ElevenLabs API...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ Audio generated successfully`);
    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Get memo by ID
   */
  getMemo(memoId) {
    return this.memos.get(memoId) || null;
  }

  /**
   * List all memos
   */
  listMemos({ limit = 20, offset = 0 } = {}) {
    const allMemos = Array.from(this.memos.values());
    const total = allMemos.length;
    const memos = allMemos
      .reverse() // Newest first
      .slice(offset, offset + limit);
    
    return {
      memos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Delete memo
   */
  deleteMemo(memoId) {
    const memo = this.memos.get(memoId);
    
    if (!memo) {
      return false;
    }
    
    // Delete audio file
    const audioPath = join(this.storageDir, memo.audio.filename);
    fs.unlink(audioPath).catch(err => {
      console.warn(`Failed to delete audio file: ${err.message}`);
    });
    
    // Remove from storage
    this.memos.delete(memoId);
    return true;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Get audio file path
   */
  getAudioPath(filename) {
    return join(this.storageDir, filename);
  }
}