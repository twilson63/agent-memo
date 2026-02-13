import type {
  Voice,
  VoiceMapping,
  Memo,
  AudioMetadata,
  TTSService
} from './types.ts';

/**
 * Memo Service - Handles text-to-speech conversion with multiple TTS providers
 * Optimized for Deno Deploy with Cache API
 */
export class MemoService {
  private ttsMode: TTSService;
  private apiKey: string | null = null;
  private apiBaseUrl: string;
  private cache: Cache | null = null;
  private voices: VoiceMapping;

  constructor(ttsMode: TTSService = 'elevenlabs', cache?: Cache) {
    this.ttsMode = ttsMode;
    this.apiKey = Deno.env.get('ELEVENLABS_API_KEY') || null;
    this.apiBaseUrl = Deno.env.get('ELEVENLABS_API_BASE_URL') ||
                     'https://api.elevenlabs.io/v1';
    this.cache = cache || null;

    // Available voices (mapped to different TTS providers)
    this.voices = {
      // ElevenLabs default voices
      june: {
        id: '21m00Tcm4TlvDq8ikWAM',
        name: 'June',
        gender: 'female',
        edgeVoice: 'en-US-JennyNeural',
        elevenlabsId: '21m00Tcm4TlvDq8ikWAM'
      },
      april: {
        id: 'AZnzlk1XvdvUeBnXmlld',
        name: 'April',
        gender: 'female',
        edgeVoice: 'en-US-EmmaNeural',
        elevenlabsId: 'AZnzlk1XvdvUeBnXmlld'
      },
      sally: {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sally',
        gender: 'female',
        edgeVoice: 'en-US-AriaNeural',
        elevenlabsId: 'EXAVITQu4vr4xnSDxMaL'
      },
      fred: {
        id: 'TxGEqnHWrfWFTfGW9XjX',
        name: 'Fred',
        gender: 'male',
        edgeVoice: 'en-US-GuyNeural',
        elevenlabsId: 'TxGEqnHWrfWFTfGW9XjX'
      },
      bill: {
        id: 'flq6f7yk4E4fJM5XTYuZ',
        name: 'Bill',
        gender: 'male',
        edgeVoice: 'en-US-EricNeural',
        elevenlabsId: 'flq6f7yk4E4fJM5XTYuZ'
      },
      // Additional premium voices
      charlie: {
        id: 'IKne3meq5aSn9XLyUdCD',
        name: 'Charlie',
        gender: 'male',
        edgeVoice: 'en-US-TonyNeural',
        elevenlabsId: 'IKne3meq5aSn9XLyUdCD'
      },
      dora: {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Dora',
        gender: 'female',
        edgeVoice: 'en-US-AnaNeural',
        elevenlabsId: 'pNInz6obpgDQGcFmaJgB'
      },
      marcus: {
        id: 'wVAW6Ij4fQ3QmWYc4JyO',
        name: 'Marcus',
        gender: 'male',
        edgeVoice: 'en-US-BrianNeural',
        elevenlabsId: 'wVAW6Ij4fQ3QmWYc4JyO'
      },
      bella: {
        id: 'XB0fDKeXKc1Xb2dQw7Jc',
        name: 'Bella',
        gender: 'female',
        edgeVoice: 'en-US-MichelleNeural',
        elevenlabsId: 'XB0fDKeXKc1Xb2dQw7Jc'
      }
    };

    console.log(`🎙️  TTS Mode: ${this.ttsMode.toUpperCase()}`);
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return Object.entries(this.voices).map(([key, voice]) => ({
      id: key,
      name: voice.name,
      gender: voice.gender
    }));
  }

  /**
   * Check if voice is valid
   */
  isValidVoice(voiceId: string) {
    return this.voices[voiceId.toLowerCase()] !== undefined;
  }

  /**
   * Create a new memo (convert text to audio)
   */
  async createMemo(text: string, voiceName: string, baseUrl: string): Promise<Memo> {
    const voiceKey = voiceName.toLowerCase();
    const voice = this.voices[voiceKey];

    if (!voice) {
      throw new Error(`Unknown voice: ${voiceName}`);
    }

    console.log(`🎙️  Creating memo with voice "${voiceName}"...`);
    console.log(`📝 Text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);

    // Generate audio from text (based on TTS mode)
    const audioBuffer = await this.generateAudio(text, voiceName);

    // Store in cache with 10-minute TTL
    const memoId = this.generateId();
    const filename = `memo_${memoId}.mp3`;

    const audioResponse = new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'max-age=600', // 10 minutes
        'Expires': new Date(Date.now() + 600000).toUTCString(),
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });

    if (this.cache) {
      const cacheKey = new Request(`${baseUrl}/audio/${filename}`);
      await this.cache.put(cacheKey, audioResponse);
      console.log(`✅ Audio cached for 10 minutes`);
    }

    // Create memo object
    const memo: Memo = {
      id: memoId,
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

    console.log(`✅ Memo created: ${memo.id}`);
    console.log(`🔗 Audio URL: ${memo.audio.url}`);

    return memo;
  }

  /**
   * Get audio from cache
   */
  async getAudio(filename: string): Promise<Response | null> {
    if (!this.cache) {
      return null;
    }

    const cacheKey = new Request(`/audio/${filename}`);
    const cached = await this.cache.match(cacheKey);

    // Cache.match() returns Response | undefined, convert to Response | null
    return cached || null;
  }

  /**
   * Generate audio from text using configured TTS provider
   */
  private async generateAudio(text: string, voiceName: string): Promise<Uint8Array> {
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
  private async generateSimulationAudio(text: string, voice: Voice): Promise<Uint8Array> {
    console.log(`🎭 Simulation mode: Generating mock audio...`);

    // Simulate processing delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate a simple audio header + silence (minimal valid MP3)
    const duration = 1 + Math.random();
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const silentData = new Uint8Array(numSamples * 2);

    // Create minimal MP3 header (very simplified)
    const mp3Header = new Uint8Array([
      0xFF, 0xFB, 0x90, 0x00,
      0xFF, 0xFA, 0x1C, 0x80
    ]);

    console.log(`✅ Simulation audio generated (${duration.toFixed(2)}s)`);
    return new Uint8Array([...mp3Header, ...silentData.slice(0, 10000)]);
  }

  /**
   * Generate audio using Edge TTS (Microsoft Read Aloud)
   */
  private async generateEdgeAudio(text: string, voice: Voice): Promise<Uint8Array> {
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

    const buffer = await response.arrayBuffer();
    console.log(`✅ Edge TTS audio generated (${(buffer.byteLength / 1024).toFixed(2)}KB)`);
    return new Uint8Array(buffer);
  }

  /**
   * Generate audio using ElevenLabs
   */
  private async generateElevenLabsAudio(text: string, voice: Voice): Promise<Uint8Array> {
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const url = `${this.apiBaseUrl}/text-to-speech/${voice.elevenlabsId || voice.id}`;

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

    const buffer = await response.arrayBuffer();
    console.log(`✅ ElevenLabs audio generated (${(buffer.byteLength / 1024).toFixed(2)}KB)`);
    return new Uint8Array(buffer);
  }

  /**
   * Create SSML for Edge TTS
   */
  private createSSML(text: string): string {
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
  private escapeSSML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Get current TTS mode
   */
  getTTSMode(): TTSService {
    return this.ttsMode;
  }
}