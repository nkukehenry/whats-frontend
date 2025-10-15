import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../utils/api';
import type { RootState } from '../store';
import type { 
  BotResponse, 
  BotTemplates, 
  BotTestResult,
  TriggerType,
  ResponseType,
  QuickReplyData,
  MultiStepData,
  ConditionalData
} from './botSlice';

// Create Bot Response
export const createBotResponseThunk = createAsyncThunk<
  BotResponse,
  {
    deviceId: number;
    name: string;
    triggerType: TriggerType;
    triggerValue: string;
    responseType: ResponseType;
    responseData: QuickReplyData | MultiStepData | ConditionalData | string;
    priority?: number;
  },
  { state: RootState; rejectValue: string }
>(
  'bot/createResponse',
  async (payload, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: BotResponse;
        message: string;
      }>('/bot/responses', {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Fetch Bot Responses for Device
export const fetchBotResponsesThunk = createAsyncThunk<
  BotResponse[],
  { deviceId: number },
  { state: RootState; rejectValue: string }
>(
  'bot/fetchResponses',
  async ({ deviceId }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: BotResponse[];
        count: number;
      }>(`/bot/devices/${deviceId}/responses`, {
        method: 'GET',
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Update Bot Response
export const updateBotResponseThunk = createAsyncThunk<
  BotResponse,
  {
    id: number;
    name?: string;
    triggerType?: TriggerType;
    triggerValue?: string;
    responseType?: ResponseType;
    responseData?: QuickReplyData | MultiStepData | ConditionalData | string;
    isActive?: boolean;
    priority?: number;
  },
  { state: RootState; rejectValue: string }
>(
  'bot/updateResponse',
  async (payload, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    const { id, ...updateData } = payload;

    try {
      const result = await apiFetch<{
        success: boolean;
        data: BotResponse;
        message: string;
      }>(`/bot/responses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Delete Bot Response
export const deleteBotResponseThunk = createAsyncThunk<
  number,
  { id: number },
  { state: RootState; rejectValue: string }
>(
  'bot/deleteResponse',
  async ({ id }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      await apiFetch<{
        success: boolean;
        message: string;
      }>(`/bot/responses/${id}`, {
        method: 'DELETE',
        token,
      });
      return id;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Fetch Bot Templates
export const fetchBotTemplatesThunk = createAsyncThunk<
  BotTemplates,
  void,
  { state: RootState; rejectValue: string }
>(
  'bot/fetchTemplates',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: BotTemplates;
      }>('/bot/templates', {
        method: 'GET',
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Test Bot Response
export const testBotResponseThunk = createAsyncThunk<
  BotTestResult,
  {
    deviceId: number;
    message: string;
    contactNumber: string;
  },
  { state: RootState; rejectValue: string }
>(
  'bot/testResponse',
  async (payload, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: BotTestResult;
      }>(`/bot/devices/${payload.deviceId}/test`, {
        method: 'POST',
        body: JSON.stringify({
          message: payload.message,
          contactNumber: payload.contactNumber,
        }),
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);
