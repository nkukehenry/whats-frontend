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
  subscription: typeof window !== 'undefined' ? (() => {
    try {
      const stored = localStorage.getItem('subscription');
      return stored ? JSON.parse(stored) : undefined;
    } catch {
      return undefined;
    }
  })() : undefined,
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
      console.log('loginSuccess reducer called with subscription:', action.payload.subscription);
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
        if (action.payload.subscription) {
          console.log('Saving subscription to localStorage:', action.payload.subscription);
          localStorage.setItem('subscription', JSON.stringify(action.payload.subscription));
        } else {
          console.log('No subscription to save, removing from localStorage');
          localStorage.removeItem('subscription');
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
    otpSuccess(state, action: PayloadAction<{ token: string; refreshToken?: string; subscription?: unknown }>) {
      console.log('otpSuccess reducer called with subscription:', action.payload.subscription);
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
        if (action.payload.subscription) {
          console.log('Saving subscription to localStorage:', action.payload.subscription);
          localStorage.setItem('subscription', JSON.stringify(action.payload.subscription));
        } else {
          console.log('No subscription to save, removing from localStorage');
          localStorage.removeItem('subscription');
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
      state.subscription = undefined;
      state.loading = false;
      state.error = null;
      state.requiresOTP = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('subscription');
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
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('subscription', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('subscription');
        }
      }
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