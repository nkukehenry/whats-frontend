// Types for API bot management functionality

export interface ApiBotConfig {
  id: number;
  userId: number;
  deviceId: number;
  name: string;
  triggerText: string;
  apiEndpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  customParams: Record<string, string>;
  requestBody: Record<string, unknown> | null;
  basicAuth: {
    username: string;
    password: string;
  } | null;
  includeSender: boolean;
  timeout: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiBotConfigRequest {
  deviceId: number;
  name: string;
  triggerText: string;
  apiEndpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  customParams?: Record<string, string>;
  requestBody?: Record<string, unknown>;
  basicAuth?: {
    username: string;
    password: string;
  };
  includeSender?: boolean;
  timeout?: number;
}

export interface UpdateApiBotConfigRequest {
  name?: string;
  triggerText?: string;
  apiEndpoint?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  customParams?: Record<string, string>;
  requestBody?: Record<string, unknown>;
  basicAuth?: {
    username: string;
    password: string;
  };
  includeSender?: boolean;
  timeout?: number;
  isActive?: boolean;
}

export interface ApiBotTestRequest {
  testMessage: string;
}

export interface ApiBotTestResponse {
  success: boolean;
  response: {
    reply: string;
    media?: string;
  };
}

export interface ApiBotConfigResponse {
  success: boolean;
  data: ApiBotConfig;
  message: string;
}

export interface ApiBotConfigsResponse {
  success: boolean;
  data: ApiBotConfig[];
}

export interface ApiBotTestResult {
  success: boolean;
  data: ApiBotTestResponse;
}

// Form data interfaces for the wizard
export interface ApiBotFormData {
  name: string;
  triggerText: string;
  apiEndpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Array<{ key: string; value: string }>;
  customParams: Array<{ key: string; value: string }>;
  requestBody: string; // JSON string
  basicAuth: {
    username: string;
    password: string;
  } | null;
  includeSender: boolean;
  timeout: number;
}

// Template placeholders that can be used in requests
export const API_BOT_PLACEHOLDERS = {
  MESSAGE: '{{message}}',
  SENDER: '{{sender}}',
  TIMESTAMP: '{{timestamp}}',
  DEVICE_ID: '{{deviceId}}',
} as const;

export type ApiBotPlaceholder = typeof API_BOT_PLACEHOLDERS[keyof typeof API_BOT_PLACEHOLDERS];

