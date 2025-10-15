import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  AvailableGroup,
  SelectedGroup,
  GroupMessage,
  GroupPagination,
} from '../types/group';

interface GroupState {
  availableGroups: AvailableGroup[];
  selectedGroups: SelectedGroup[];
  messages: Record<string, GroupMessage[]>; // Keyed by groupId
  loading: boolean;
  error: string | null;
  fetchingGroups: boolean;
  selectingGroup: boolean;
  sendingMessage: boolean;
  fetchingMessages: boolean;
  broadcasting: boolean;
  broadcastResults: Array<{
    groupId: string;
    groupName: string;
    status: 'sent' | 'failed';
    messageId?: string;
    error?: string;
  }> | null;
  pagination: Record<string, GroupPagination>; // Keyed by groupId
}

const initialState: GroupState = {
  availableGroups: [],
  selectedGroups: [],
  messages: {},
  loading: false,
  error: null,
  fetchingGroups: false,
  selectingGroup: false,
  sendingMessage: false,
  fetchingMessages: false,
  broadcasting: false,
  broadcastResults: null,
  pagination: {},
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAvailableGroups: (state, action: PayloadAction<AvailableGroup[]>) => {
      state.availableGroups = action.payload;
    },
    setSelectedGroups: (state, action: PayloadAction<SelectedGroup[]>) => {
      state.selectedGroups = action.payload;
    },
    addSelectedGroup: (state, action: PayloadAction<SelectedGroup>) => {
      state.selectedGroups.unshift(action.payload);
    },
    updateSelectedGroup: (state, action: PayloadAction<SelectedGroup>) => {
      const index = state.selectedGroups.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.selectedGroups[index] = action.payload;
      }
    },
    removeSelectedGroup: (state, action: PayloadAction<number>) => {
      state.selectedGroups = state.selectedGroups.filter(g => g.id !== action.payload);
    },
    setGroupMessages: (state, action: PayloadAction<{ groupId: string; messages: GroupMessage[] }>) => {
      state.messages[action.payload.groupId] = action.payload.messages;
    },
    addGroupMessage: (state, action: PayloadAction<{ groupId: string; message: GroupMessage }>) => {
      if (!state.messages[action.payload.groupId]) {
        state.messages[action.payload.groupId] = [];
      }
      state.messages[action.payload.groupId].unshift(action.payload.message);
    },
    updateGroupMessages: (state, action: PayloadAction<{ groupId: string; messages: GroupMessage[] }>) => {
      if (!state.messages[action.payload.groupId]) {
        state.messages[action.payload.groupId] = [];
      }
      // Merge with existing messages, avoiding duplicates
      const existingMessages = state.messages[action.payload.groupId];
      const newMessages = action.payload.messages.filter(
        newMsg => !existingMessages.some(existingMsg => existingMsg.id === newMsg.id)
      );
      state.messages[action.payload.groupId] = [...newMessages, ...existingMessages];
    },
    setGroupPagination: (state, action: PayloadAction<{ groupId: string; pagination: GroupPagination }>) => {
      state.pagination[action.payload.groupId] = action.payload.pagination;
    },
    clearGroupMessages: (state, action: PayloadAction<string>) => {
      delete state.messages[action.payload];
      delete state.pagination[action.payload];
    },
    setBroadcastResults: (state, action: PayloadAction<Array<{
      groupId: string;
      groupName: string;
      status: 'sent' | 'failed';
      messageId?: string;
      error?: string;
    }> | null>) => {
      state.broadcastResults = action.payload;
    },
    clearBroadcastResults: (state) => {
      state.broadcastResults = null;
    },
  },
  extraReducers: () => {
    // We'll handle thunk cases in the components that dispatch them
    // This avoids circular import issues
  },
});

export const {
  clearError,
  setAvailableGroups,
  setSelectedGroups,
  addSelectedGroup,
  updateSelectedGroup,
  removeSelectedGroup,
  setGroupMessages,
  addGroupMessage,
  updateGroupMessages,
  setGroupPagination,
  clearGroupMessages,
  setBroadcastResults,
  clearBroadcastResults,
} = groupSlice.actions;

export default groupSlice.reducer;
