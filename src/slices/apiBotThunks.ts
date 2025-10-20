import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../utils/api';
import type { RootState } from '../store';
import type { 
  ApiBotConfig,
  CreateApiBotConfigRequest,
  UpdateApiBotConfigRequest,
  ApiBotTestRequest,
  ApiBotTestResult,
  ApiBotConfigResponse,
  ApiBotConfigsResponse,
} from '../types/apiBot';

// Create API Bot Configuration
export const createApiBotConfigThunk = createAsyncThunk<
  ApiBotConfig,
  CreateApiBotConfigRequest,
  { state: RootState; rejectValue: string }
>(
  'apiBot/createConfig',
  async (payload, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<ApiBotConfigResponse>('/api-bot/configs', {
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

// Fetch API Bot Configurations for Device
export const fetchApiBotConfigsThunk = createAsyncThunk<
  ApiBotConfig[],
  { deviceId: number },
  { state: RootState; rejectValue: string }
>(
  'apiBot/fetchConfigs',
  async ({ deviceId }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<ApiBotConfigsResponse>(`/api-bot/configs?deviceId=${deviceId}`, {
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

// Update API Bot Configuration
export const updateApiBotConfigThunk = createAsyncThunk<
  ApiBotConfig,
  { id: number; data: UpdateApiBotConfigRequest },
  { state: RootState; rejectValue: string }
>(
  'apiBot/updateConfig',
  async ({ id, data }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<ApiBotConfigResponse>(`/api-bot/configs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
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

// Delete API Bot Configuration
export const deleteApiBotConfigThunk = createAsyncThunk<
  number,
  { id: number },
  { state: RootState; rejectValue: string }
>(
  'apiBot/deleteConfig',
  async ({ id }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      await apiFetch<{ success: boolean; message: string }>(`/api-bot/configs/${id}`, {
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

// Test API Bot Configuration
export const testApiBotConfigThunk = createAsyncThunk<
  ApiBotTestResult,
  { id: number; testData: ApiBotTestRequest },
  { state: RootState; rejectValue: string }
>(
  'apiBot/testConfig',
  async ({ id, testData }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{ success: boolean; data: ApiBotTestResult }>(`/api-bot/configs/${id}/test`, {
        method: 'POST',
        body: JSON.stringify(testData),
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



