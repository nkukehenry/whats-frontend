import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { setLoading, setError, setMessages, setStats, setSending, setSendError, addMessage } from './messageSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Send a single message
export const sendMessageThunk = createAsyncThunk(
  'message/sendMessage',
  async (
    { to, message, deviceId }: { to: string; message: string; deviceId?: number },
    { dispatch, getState }
  ) => {
    try {
      dispatch(setSending(true));
      dispatch(setSendError(null));

      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ to, message, deviceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const result = await response.json();
      
      // Add the message to the list (you might want to fetch the actual message from the server)
      const newMessage = {
        id: Date.now(), // Temporary ID
        to,
        body: message,
        sentAt: new Date().toISOString(),
        status: 'SENT' as const,
        deviceId: deviceId || 0,
      };
      
      dispatch(addMessage(newMessage));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch(setSendError(errorMessage));
      throw error;
    } finally {
      dispatch(setSending(false));
    }
  }
);

// Send bulk messages
export const sendBulkMessageThunk = createAsyncThunk(
  'message/sendBulkMessage',
  async (
    { recipients, message, deviceId, file }: { recipients?: string[]; message: string; deviceId?: number; file?: File },
    { dispatch, getState }
  ) => {
    try {
      dispatch(setSending(true));
      dispatch(setSendError(null));

      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      let response;
      if (file) {
        // Send as multipart/form-data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', message);
        if (deviceId) formData.append('deviceId', deviceId.toString());
        response = await fetch(`${API_BASE_URL}/messages/send-bulk`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Send as JSON
        response = await fetch(`${API_BASE_URL}/messages/send-bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ recipients, message, deviceId }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send bulk messages');
      }

      const result = await response.json();
      // Optionally dispatch addMessage for each recipient if needed
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send bulk messages';
      dispatch(setSendError(errorMessage));
      throw error;
    } finally {
      dispatch(setSending(false));
    }
  }
);

// Fetch message history
export const fetchMessagesThunk = createAsyncThunk(
  'message/fetchMessages',
  async (_, { dispatch, getState }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const messages = await response.json();
      dispatch(setMessages(messages));
      
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch message statistics
export const fetchMessageStatsThunk = createAsyncThunk(
  'message/fetchStats',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/messages/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch message statistics');
      }

      const stats = await response.json();
      dispatch(setStats(stats));
      
      return stats;
    } catch (error) {
      console.error('Failed to fetch message stats:', error);
      // Don't throw error for stats as it's not critical
    }
  }
); 