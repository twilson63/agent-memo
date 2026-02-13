/**
 * Types for Agent Memo API
 */

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  edgeVoice?: string;
  elevenlabsId?: string;
}

export interface VoiceMapping {
  [key: string]: Voice;
}

export interface AudioMetadata {
  filename: string;
  url: string;
  length: number;
  format: string;
}

export interface Memo {
  id: string;
  text: string;
  voice: {
    id: string;
    name: string;
  };
  audio: AudioMetadata;
  createdAt: string;
}

export interface CreateMemoRequest {
  text: string;
  voice: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  ttsMode: string;
}

export interface VoicesResponse {
  voices: Array<Pick<Voice, 'id' | 'name' | 'gender'>>;
}

export interface MemosResponse {
  memos: Memo[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ErrorResponse {
  error: string;
  memoId?: string;
  requestedVoice?: string;
  availableVoices?: VoicesResponse['voices'];
}

export type TTSService = 'simulation' | 'edge' | 'elevenlabs';