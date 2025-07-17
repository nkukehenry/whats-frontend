"use client";
import { ReactNode, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import { setToken, setUser, setHydrated } from '../slices/authSlice';

function decodeJwt(token: string): { email?: string; isAdmin?: boolean } {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

function RehydrateAuth() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
      const decoded = decodeJwt(token);
      if (decoded.email) {
        dispatch(setUser({ email: decoded.email, isAdmin: decoded.isAdmin }));
      }
    }
    dispatch(setHydrated());
    // Listen for storage events (multi-tab sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token' && typeof e.newValue === 'string') {
        dispatch(setToken(e.newValue));
        const decoded = decodeJwt(e.newValue);
        if (decoded.email) {
          dispatch(setUser({ email: decoded.email, isAdmin: decoded.isAdmin }));
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [dispatch]);
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <RehydrateAuth />
      {children}
    </Provider>
  );
} 