import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../utils/api';
import type { RootState } from '../store';
import { setLoading, setError, setMessages, setStats, setSending, setSendError, addMessage } from './messageSlice';

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

      const result = await apiFetch<{
        success: boolean;
        data: {
          id: number;
          to: string;
          message: string;
          status: 'PENDING' | 'SENT' | 'FAILED';
          sentAt: string;
          deviceId: number;
        };
        message: string;
      }>('/messages/send', {
        method: 'POST',
        body: JSON.stringify({ to, message, deviceId }),
        token,
      });
      
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
      
      return result.data || result;
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

      let result;
      if (file) {
        // Send as multipart/form-data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', message);
        if (deviceId)         formData.append('deviceId', deviceId.toString());
        
        result = await apiFetch<{
          success: boolean;
          data: {
            sent: number;
            failed: number;
            total: number;
            results: Array<{
              to: string;
              status: 'PENDING' | 'SENT' | 'FAILED';
              message?: string;
            }>;
          };
          message: string;
        }>('/messages/send-bulk', {
          method: 'POST',
          body: formData,
          token,
        });
      } else {
        // Send as JSON
        result = await apiFetch<{
          success: boolean;
          data: {
            sent: number;
            failed: number;
            total: number;
            results: Array<{
              to: string;
              status: 'PENDING' | 'SENT' | 'FAILED';
              message?: string;
            }>;
          };
          message: string;
        }>('/messages/send-bulk', {
          method: 'POST',
          body: JSON.stringify({ recipients, message, deviceId }),
          token,
        });
      }
      // Optionally dispatch addMessage for each recipient if needed
      return result.data || result;
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

      const messages = await apiFetch<{
        success: boolean;
        data: Array<{
          id: number;
          to: string;
          body: string;
          sentAt: string;
          status: 'PENDING' | 'SENT' | 'FAILED';
          deviceId: number;
        }>;
        message: string;
      }>('/messages', {
        method: 'GET',
        token,
      });
      dispatch(setMessages(messages.data || messages));
      
      return messages.data || messages;
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

      const stats = await apiFetch<{
        success: boolean;
        data: {
          totalMessages: number;
          messagesThisMonth: number;
          planLimit: number;
          remainingMessages: number;
        };
        message: string;
      }>('/messages/stats', {
        method: 'GET',
        token,
      });
      dispatch(setStats(stats.data || stats));
      
      return stats.data || stats;
    } catch (error) {
      console.error('Failed to fetch message stats:', error);
      // Don't throw error for stats as it's not critical
    }
  }
); 