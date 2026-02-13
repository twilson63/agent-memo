import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Memo Service - Handles text-to-speech conversion with multiple TTS providers
 */
export class MemoService {
  constructor() {
    // TTS Configuration
    this.ttsMode = process.env.TTS_MODE || 'elevenlabs'; // 'simulation' | 'edge' | 'elevenlabs'
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.apiBaseUrl = process.env.ELEVENLABS_API_BASE_URL || 'https://api.elevenlabs.io/v1';
    this.storageDir = join(__dirname, '../storage');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    // Available voices (mapped from official ElevenLabs premade voices)
    this.voices = {
      // ElevenLabs premade voices (official voice IDs)
      rachel: {
        name: 'Rachel',
        id: '21m00Tcm4TlvDq8ikWAM',
        gender: 'female',
        description: 'Young, American, calm narration'
      },
      domi: {
        name: 'Domi',
        id: 'AZnzlk1XvdvUeBnXmlld',
        gender: 'female',
        description: 'Strong, professional narration'
      },
      sarah: {
        name: 'Sarah',
        id: 'EXAVITQu4vr4xnSDxMaL',
        gender: 'female',
        description: 'Soft news presenter'
      },
      emily: {
        name: 'Emily',
        id: 'LcfcDJNUP1GQjkzn1xUU',
        gender: 'female',
        description: 'Calm meditation guide'
      },
      freya: {
        name: 'Freya',
        id: 'jsCqWAovK2LkecY7zXl4',
        gender: 'female',
        description: 'Young, American'
      },
      dorothy: {
        name: 'Dorothy',
        id: 'ThT5KcBeYPX3keUQqHPh',
        gender: 'female',
        description: 'British, children\'s stories'
      },
      adam: {
        name: 'Adam',
        id: 'pNInz6obpgDQGcFmaJgB',
        gender: 'male',
        description: 'Deep narration voice'
      },
      bill: {
        name: 'Bill',
        id: 'pqHfZKP75CvOlQylNhV4',
        gender: 'male',
        description: 'Strong documentary voice'
      },
      charlie: {
        name: 'Charlie',
        id: 'IKne3meq5aSn9XLyUdCD',
        gender: 'male',
        description: 'Australian, casual conversational'
      },
      ethan: {
        name: 'Ethan',
        id: 'g5CIjZEefAph4nQFvHAz',
        gender: 'male',
        description: 'ASMR, soft-spoken'
      }
    };

    // In-memory memo storage (in production, use database)
    this.memos = new Map();

    console.log(`🎙️  TTS Mode: ${this.ttsMode.toUpperCase()}`);
    console.log(`📊 Available Voices: ${Object.keys(this.voices).length}`);
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
  async createMemo(text, voiceName, baseUrl = this.baseUrl) {
    const voiceKey = voiceName.toLowerCase();
    const voice = this.voices[voiceKey];
    
    if (!voice) {
      throw new Error(`Unknown voice: ${voiceName}`);
    }

    console.log(`🎙️  Creating memo with voice "${voiceName}"...`);
    console.log(`📝 Text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);

    // Generate audio from text (based on TTS mode)
    const audioBuffer = await this.generateAudio(text, voiceName);
    
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
        name: voice.name
      },
      audio: {
        filename: filename,
        url: `${baseUrl}/audio/${filename}`,
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
   * Generate audio from text using configured TTS provider
   */
  async generateAudio(text, voiceName) {
    const voice = this.voices[voiceName.toLowerCase()];
    
    switch (this.ttsMode) {
      case 'simulation':
        return await this.generateSimulationAudio(text, voice);
      
      case 'edge':
        return await this.generateEdgeAudio(text, voice);
      
      case 'elevenlabs':
        return await this.generateElevenLabsAudio(text, voice);
      
      default:
        throw new Error(`Unknown TTS mode: ${this.ttsMode}`);
    }
  }

  /**
   * Generate simulation audio (mock for testing)
   */
  async generateSimulationAudio(text, voice) {
    console.log(`🎭 Simulation mode: Generating mock audio...`);
    
    // Simulate processing delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Generate a simple audio header + silence (minimal valid MP3)
    // This creates a 1-2 second silent audio file
    const duration = 1 + Math.random();
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const silentData = Buffer.alloc(numSamples * 2); // 16-bit samples
    
    // Create minimal MP3 header (very simplified)
    const mp3Header = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, // ID3v2 frame header
      0xFF, 0xFA, 0x1C, 0x80  // MPEG header
    ]);
    
    console.log(`✅ Simulation audio generated (${duration.toFixed(2)}s)`);
    return Buffer.concat([mp3Header, silentData.slice(0, 10000)]);
  }

  /**
   * Generate audio using Edge TTS (Microsoft Read Aloud)
   */
  async generateEdgeAudio(text, voice) {
    console.log(`🌐 Edge TTS mode: Using Microsoft Read Aloud...`);
    
    if (!voice.edgeVoice) {
      throw new Error(`No Edge TTS voice mapping for: ${voice.name}`);
    }
    
    const url = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
    const params = new URLSearchParams({
      'mkt': 'en-US',
      'voice': voice.edgeVoice
    });
    
    const response = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-EdgeTTS-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
      },
      body: this.createSSML(text)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Edge TTS error:', error);
      throw new Error(`Edge TTS error: ${response.status} ${response.statusText}`);
    }
    
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ Edge TTS audio generated (${(audioBuffer.length / 1024).toFixed(2)}KB)`);
    return audioBuffer;
  }

  /**
   * Generate audio using ElevenLabs
   */
  async generateElevenLabsAudio(text, voice) {
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const url = `${this.apiBaseUrl}/text-to-speech/${voice.id}`;
    
    console.log(`🔗 Calling ElevenLabs API...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
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

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ ElevenLabs audio generated (${(audioBuffer.length / 1024).toFixed(2)}KB)`);
    return audioBuffer;
  }

  /**
   * Create SSML for Edge TTS
   */
  createSSML(text) {
    return `
<speak version='1.0' xml:lang='en-US'>
  <voice>
    <speak>${this.escapeSSML(text)}</speak>
  </voice>
</speak>
    `.trim();
  }

  /**
   * Escape special characters in SSML
   */
  escapeSSML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
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

  /**
   * Get current TTS mode
   */
  getTTSMode() {
    return this.ttsMode;
  }
}