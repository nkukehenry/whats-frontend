import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../utils/api';
import type { RootState } from '../store';
import type { Device } from './deviceSlice';

export const addDeviceThunk = createAsyncThunk<
  Device,
  { name: string; waNumber: string },
  { state: RootState; rejectValue: string }
>(
  'devices/add',
  async (
    { name, waNumber }: { name: string; waNumber: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');
    try {
      // Add device via API
      const addResult = await apiFetch<{
        success: boolean;
        data: {
          id: number;
          name: string;
          waNumber: string;
          isActive: boolean;
          createdAt: string;
        };
      }>('/devices/add', {
        method: 'POST',
        body: JSON.stringify({ name, waNumber }),
        token,
      });
      const deviceId = addResult.data.id;
      
      // Fetch QR and status with retry logic
      const device: Device = {
        id: addResult.data.id,
        name: addResult.data.name,
        waNumber: addResult.data.waNumber,
        isActive: addResult.data.isActive,
        createdAt: addResult.data.createdAt,
      };
      
      // Try to fetch status with retry logic
      const maxRetries = 3;
      let statusResult: {
        success: boolean;
        data: {
          qr?: string;
          qrDataUrl?: string;
          status?: string;
        };
      } | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          statusResult = await apiFetch<{
            success: boolean;
            data: {
              qr?: string;
              qrDataUrl?: string;
              status?: string;
            };
          }>(`/devices/status/${deviceId}`, {
            method: 'GET',
            token,
          });
          break; // Success, exit retry loop
        } catch (err: unknown) {
          console.warn(`Initial status fetch attempt ${attempt}/${maxRetries} failed:`, err);
          
          // If this is not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          }
        }
      }
      
      // Add status data if we got it (even if some attempts failed)
      if (statusResult?.data) {
        if (statusResult.data.qr) device.qr = statusResult.data.qr;
        if (statusResult.data.qrDataUrl) device.qrDataUrl = statusResult.data.qrDataUrl;
        if (statusResult.data.status) device.status = statusResult.data.status;
      }
      
      return device;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

export const fetchDevicesThunk = createAsyncThunk<
  Device[],
  void,
  { state: RootState; rejectValue: string }
>(
  'devices/fetch',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');
    try {
      const data = await apiFetch<{
        success: boolean;
        data: Array<{
          id: number;
          name: string;
          waNumber: string;
          isActive: boolean;
          createdAt: string;
        }>;
      }>('/devices/list', {
        method: 'GET',
        token,
      });
      return data.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

export const fetchDeviceStatusThunk = createAsyncThunk<
  { deviceId: number; qr?: string; qrDataUrl?: string; status?: string },
  { deviceId: number },
  { state: RootState; rejectValue: string }
>(
  'devices/fetchStatus',
  async (
    { deviceId }: { deviceId: number },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');
    
    // Retry logic for status fetching
    const maxRetries = 3;
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiFetch<{
          success: boolean;
          data: {
            qr?: string;
            qrDataUrl?: string;
            status?: string;
          };
        }>(`/devices/status/${deviceId}`, {
          method: 'GET',
          token,
        });
        return {
          deviceId,
          ...result.data,
        };
      } catch (err: unknown) {
        lastError = err;
        console.warn(`Status fetch attempt ${attempt}/${maxRetries} failed:`, err);
        
        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }
    
    // All retries failed
    if (lastError && typeof lastError === 'object' && 'message' in lastError) {
      return rejectWithValue((lastError as { message?: string }).message || 'Failed to fetch device status after retries');
    }
    return rejectWithValue('Failed to fetch device status after retries');
  }
);

export const removeDeviceThunk = createAsyncThunk<
  number, // returns the removed deviceId
  { deviceId: number },
  { state: RootState; rejectValue: string }
>(
  'devices/remove',
  async (
    { deviceId },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');
    try {
      await apiFetch<{ success: boolean }>(
        `/devices/remove/${deviceId}`,
        {
          method: 'DELETE',
          token,
        }
      );
      return deviceId;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
); 