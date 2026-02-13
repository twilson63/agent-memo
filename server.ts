import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import type { MemoService } from './memo-service.ts';
import {
  HealthResponse,
  VoicesResponse,
  Memo,
  CreateMemoRequest,
  ErrorResponse
} from './types.ts';

/**
 * Initialize memo service with cache
 */
async function initializeService() {
  // Open Cache API for audio files
  const cache = await caches.open('agent-memo-audio');

  // Get TTS mode from environment (default to simulation for Deno Deploy)
  const ttsMode = (Deno.env.get('TTS_MODE') as 'simulation' | 'edge' | 'elevenlabs') || 'simulation';

  // Import memo service (dynamic import to avoid circular dependency)
  const { MemoService: Service } = await import('./memo-service.ts');
  return new Service(ttsMode, cache);
}

/**
 * Start Deno Deploy server
 */
async function startServer() {
  const memoService = await initializeService();
  const baseUrl = Deno.env.get('BASE_URL') || 'https://agent-memo.deno.dev';

  console.log(`
╔═════════════════════════════════════════════════════════╗
║           🎙️  Agent Memo API - Deno Deploy              ║
╚═════════════════════════════════════════════════════════╝

  📍 API:  ${baseUrl}
  🔊 TTS:  ${memoService.getTTSMode().toUpperCase()}
  📚 Docs: ${baseUrl}/health

  Available Voices:
  ${memoService.getAvailableVoices().map(v => `    • ${v.name} (${v.gender})`).join('\n')}

  💡 Cache: Audio files cached for 10 minutes
  ⚡ Powered by Deno Deploy Cache API

`);

  await serve(async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Log request
    console.log(`${req.method} ${path}`);

    // Health check
    if (path === '/health') {
      const response: HealthResponse = {
        status: 'ok',
        service: 'Agent Memo',
        version: '1.1.0',
        timestamp: new Date().toISOString(),
        ttsMode: memoService.getTTSMode()
      };
      return Response.json(response);
    }

    // List available voices
    if (path === '/voices') {
      const response: VoicesResponse = {
        voices: memoService.getAvailableVoices()
      };
      return Response.json(response);
    }

    // Serve audio files (from Cache API)
    if (path.startsWith('/audio/')) {
      const filename = path.substring('/audio/'.length);

      // Try to get from cache
      const cached = await memoService.getAudio(filename);
      if (cached) {
        console.log(`✅ Cache hit: ${filename}`);
        return cached;
      }

      // Not found
      const error: ErrorResponse = {
        error: 'Audio not found or expired',
        filename
      };
      return Response.json(error, { status: 404 });
    }

    // Create memo (POST)
    if (path === '/memo' && req.method === 'POST') {
      try {
        const body: CreateMemoRequest = await req.json();
        const { text, voice } = body;

        // Validate input
        if (!text || typeof text !== 'string') {
          const error: ErrorResponse = {
            error: 'Invalid input: text is required and must be a string'
          };
          return Response.json(error, { status: 400 });
        }

        if (!voice || typeof voice !== 'string') {
          const error: ErrorResponse = {
            error: 'Invalid input: voice is required and must be a string'
          };
          return Response.json(error, { status: 400 });
        }

        // Validate voice
        if (!memoService.isValidVoice(voice)) {
          const error: ErrorResponse = {
            error: 'Invalid voice',
            requestedVoice: voice,
            availableVoices: memoService.getAvailableVoices()
          };
          return Response.json(error, { status: 400 });
        }

        // Generate memo
        const memo: Memo = await memoService.createMemo(text, voice, baseUrl);

        return Response.json(memo, { status: 201 });
      } catch (error) {
        console.error('Error creating memo:', error);
        const errorResponse: ErrorResponse = {
          error: 'Failed to create memo',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
        return Response.json(errorResponse, { status: 500 });
      }
    }

    // Get memo by ID (not supported in Deno Deploy - no persistence)
    if (path.startsWith('/memo/') && req.method === 'GET') {
      const error: ErrorResponse = {
        error: 'Memo retrieval not supported in Deno Deploy mode',
        hint: 'Use the audio URL from the memo creation response'
      };
      return Response.json(error, { status: 501 });
    }

    // List all memos (not supported in Deno Deploy - no persistence)
    if (path === '/memos' && req.method === 'GET') {
      const error: ErrorResponse = {
        error: 'Memo listing not supported in Deno Deploy mode',
        hint: 'Audio files are cached for 10 minutes, not persisted'
      };
      return Response.json(error, { status: 501 });
    }

    // Delete memo
    if (path.startsWith('/memo/') && req.method === 'DELETE') {
      const error: ErrorResponse = {
        error: 'Memo deletion not supported in Deno Deploy mode',
        hint: 'Audio files expire automatically after 10 minutes'
      };
      return Response.json(error, { status: 501 });
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // 404 Not Found
    const error: ErrorResponse = {
      error: 'Not Found',
      path
    };
    return Response.json(error, { status: 404 });
  });
}

// Start the server
await startServer();