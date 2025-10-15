import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import messageReducer from './slices/messageSlice';
import botReducer from './slices/botSlice';
import groupReducer from './slices/groupSlice';
import { createDeviceSlice } from './slices/deviceSlice';
import { fetchDevicesThunk, addDeviceThunk, fetchDeviceStatusThunk, removeDeviceThunk } from './slices/deviceThunks';

const deviceSlice = createDeviceSlice({ fetchDevicesThunk, addDeviceThunk, fetchDeviceStatusThunk, removeDeviceThunk });

export const store = configureStore({
  reducer: {
    auth: authReducer,
    devices: deviceSlice.reducer,
    messages: messageReducer,
    bot: botReducer,
    groups: groupReducer,
  },
});

export const { clearDevices, clearError } = deviceSlice.actions;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 