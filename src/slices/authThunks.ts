import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../utils/api';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  otpRequired,
  otpStart,
  otpSuccess,
  otpFailure,
} from './authSlice';

// Login thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { dispatch }
  ) => {
    dispatch(loginStart());
    try {
      const data = await apiFetch<{
        success: boolean;
        requiresOTP: boolean;
        token?: string;
        refreshToken?: string;
        subscription?: unknown;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.requiresOTP) {
        dispatch(otpRequired({ email }));
      } else if (data.token) {
        console.log('Login success - subscription from API:', data.subscription);
        dispatch(loginSuccess({ email, token: data.token, refreshToken: data.refreshToken, subscription: data.subscription }));
      } else {
        dispatch(loginFailure('Unknown login response'));
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        dispatch(loginFailure((err as { message?: string }).message || 'Unknown error'));
      } else {
        dispatch(loginFailure('Unknown error'));
      }
    }
  }
);

// OTP thunk
export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (
    { email, otp }: { email: string; otp: string },
    { dispatch }
  ) => {
    dispatch(otpStart());
    try {
      const data = await apiFetch<{
        success: boolean;
        token: string;
        refreshToken?: string;
        subscription?: unknown;
      }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      console.log('OTP verification success - subscription from API:', data.subscription);
      dispatch(otpSuccess({ token: data.token, refreshToken: data.refreshToken, subscription: data.subscription }));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        dispatch(otpFailure((err as { message?: string }).message || 'Unknown error'));
      } else {
        dispatch(otpFailure('Unknown error'));
      }
    }
  }
);

// Registration thunk
export const registerThunk = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, phone }: { name: string; email: string; password: string; phone: string },
    { dispatch }
  ) => {
    dispatch(loginStart());
    try {
      const data = await apiFetch<{ success: boolean; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      });
      return data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        dispatch(loginFailure((err as { message?: string }).message || 'Unknown error'));
      } else {
        dispatch(loginFailure('Unknown error'));
      }
      throw err;
    }
  }
); 