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
      // Optionally fetch QR and status
      const statusResult = await apiFetch<{
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
      const device: Device = {
        id: addResult.data.id,
        name: addResult.data.name,
        waNumber: addResult.data.waNumber,
        isActive: addResult.data.isActive,
        createdAt: addResult.data.createdAt,
      };
      if (statusResult.data.qr) device.qr = statusResult.data.qr;
      if (statusResult.data.qrDataUrl) device.qrDataUrl = statusResult.data.qrDataUrl;
      if (statusResult.data.status) device.status = statusResult.data.status;
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
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
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