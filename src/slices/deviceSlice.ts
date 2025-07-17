import { createSlice, PayloadAction, AsyncThunk } from '@reduxjs/toolkit';
// Do NOT import thunks or export a default reducer here

export interface Device {
  id: number;
  name: string;
  waNumber: string;
  isActive: boolean;
  createdAt: string;
  qr?: string;
  qrCodeUrl?: string;
  qrDataUrl?: string;
  status?: string;
}

export interface DeviceStatus {
  deviceId: number;
  qr?: string;
  qrDataUrl?: string;
  status?: string;
}

interface DeviceState {
  devices: Device[];
  loading: boolean;
  error: string | null;
  deviceStatusMap: { [deviceId: number]: DeviceStatus };
}

const initialState: DeviceState = {
  devices: [],
  loading: false,
  error: null,
  deviceStatusMap: {},
};

export function createDeviceSlice({ fetchDevicesThunk, addDeviceThunk, fetchDeviceStatusThunk }: {
  fetchDevicesThunk: AsyncThunk<Device[], void, { state: unknown; rejectValue: string }>;
  addDeviceThunk: AsyncThunk<Device, { name: string; waNumber: string }, { state: unknown; rejectValue: string }>;
  fetchDeviceStatusThunk: AsyncThunk<DeviceStatus, { deviceId: number }, { state: unknown; rejectValue: string }>;
}) {
  return createSlice({
    name: 'devices',
    initialState,
    reducers: {
      clearDevices: (state) => {
        state.devices = [];
        state.error = null;
        state.deviceStatusMap = {};
      },
      clearError: (state) => {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchDevicesThunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchDevicesThunk.fulfilled, (state, action: PayloadAction<Device[]>) => {
          state.loading = false;
          state.devices = action.payload;
          state.error = null;
        })
        .addCase(fetchDevicesThunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch devices';
        })
        .addCase(addDeviceThunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(addDeviceThunk.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
        })
        .addCase(addDeviceThunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Failed to add device';
        })
        .addCase(fetchDeviceStatusThunk.fulfilled, (state, action: PayloadAction<{ deviceId: number; status?: string; qr?: string; qrDataUrl?: string }>) => {
          const { deviceId, status, qr, qrDataUrl } = action.payload;
          state.deviceStatusMap[deviceId] = { deviceId, status, qr, qrDataUrl };
        });
    },
  });
}

export const selectDeviceStatus = (state: { devices: DeviceState }, deviceId: number) => state.devices.deviceStatusMap[deviceId] || {};
// No default export here! 