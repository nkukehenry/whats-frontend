import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: null | { email: string };
  token: string | null;
  refreshToken: string | null;
  requiresOTP: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  subscription?: unknown; // NEW
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  requiresOTP: false,
  loading: false,
  error: null,
  hydrated: false,
  subscription: undefined, // NEW
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
      state.requiresOTP = false;
    },
    loginSuccess(state, action: PayloadAction<{ email: string; token: string; refreshToken?: string; subscription?: unknown }>) {
      state.user = { email: action.payload.email };
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.subscription = action.payload.subscription;
      state.loading = false;
      state.error = null;
      state.requiresOTP = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }
      }
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.token = null;
      state.user = null;
      state.requiresOTP = false;
    },
    otpRequired(state, action: PayloadAction<{ email: string }>) {
      state.user = { email: action.payload.email };
      state.loading = false;
      state.error = null;
      state.requiresOTP = true;
    },
    otpStart(state) {
      state.loading = true;
      state.error = null;
    },
    otpSuccess(state, action: PayloadAction<{ token: string; refreshToken?: string }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.loading = false;
      state.error = null;
      state.requiresOTP = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }
      }
    },
    otpFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      state.requiresOTP = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearToken(state) {
      state.token = null;
    },
    setUser(state, action: PayloadAction<{ email: string; isAdmin?: boolean }>) {
      state.user = { email: action.payload.email };
      // Optionally add isAdmin, etc.
    },
    setHydrated(state) {
      state.hydrated = true;
    },
    setSubscription(state, action: PayloadAction<unknown>) {
      state.subscription = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  otpRequired,
  otpStart,
  otpSuccess,
  otpFailure,
  logout,
  setToken,
  clearToken,
  setUser,
  setHydrated,
  setSubscription,
} = authSlice.actions;
export default authSlice.reducer; 