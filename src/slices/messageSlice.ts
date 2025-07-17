import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: number;
  to: string;
  body: string;
  sentAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error?: string;
  deviceId: number;
}

export interface MessageStats {
  totalMessages: number;
  messagesThisMonth: number;
  planLimit: number;
  remainingMessages: number;
}

interface MessageState {
  messages: Message[];
  stats: MessageStats | null;
  loading: boolean;
  error: string | null;
  sending: boolean;
  sendError: string | null;
}

const initialState: MessageState = {
  messages: [],
  stats: null,
  loading: false,
  error: null,
  sending: false,
  sendError: null,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setStats: (state, action: PayloadAction<MessageStats>) => {
      state.stats = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.sending = action.payload;
    },
    setSendError: (state, action: PayloadAction<string | null>) => {
      state.sendError = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
    },
    updateMessageStatus: (state, action: PayloadAction<{ id: number; status: Message['status']; error?: string }>) => {
      const message = state.messages.find(msg => msg.id === action.payload.id);
      if (message) {
        message.status = action.payload.status;
        if (action.payload.error) {
          message.error = action.payload.error;
        }
      }
    },
    clearSendError: (state) => {
      state.sendError = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setMessages,
  setStats,
  setSending,
  setSendError,
  addMessage,
  updateMessageStatus,
  clearSendError,
} = messageSlice.actions;

export default messageSlice.reducer; 