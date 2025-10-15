import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../utils/api';
import type { RootState } from '../store';
import type {
  SelectedGroup,
  GroupMessage,
  SendGroupMessageResponse,
  GroupPagination,
  AvailableGroupsData,
} from '../types/group';

// Fetch available groups from a device
export const fetchAvailableGroupsThunk = createAsyncThunk<
  AvailableGroupsData,
  { deviceId: number },
  { state: RootState; rejectValue: string }
>(
  'groups/fetchAvailableGroups',
  async ({ deviceId }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: AvailableGroupsData;
      }>(`/groups/available/${deviceId}`, {
        method: 'GET',
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Select a group for monitoring
export const selectGroupThunk = createAsyncThunk<
  SelectedGroup,
  {
    deviceId: number;
    groupId: string;
    groupName: string;
    groupDescription: string;
    participantCount: number;
    autoReply?: boolean;
  },
  { state: RootState; rejectValue: string }
>(
  'groups/selectGroup',
  async (payload, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: SelectedGroup;
        message: string;
      }>('/groups/select', {
        method: 'POST',
        body: JSON.stringify({
          deviceId: payload.deviceId,
          groupId: payload.groupId,
          groupName: payload.groupName,
          groupDescription: payload.groupDescription,
          participantCount: payload.participantCount,
          autoReply: payload.autoReply || false,
        }),
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Fetch user's selected groups
export const fetchSelectedGroupsThunk = createAsyncThunk<
  SelectedGroup[],
  void,
  { state: RootState; rejectValue: string }
>(
  'groups/fetchSelectedGroups',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: SelectedGroup[];
      }>('/groups', {
        method: 'GET',
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Update group settings
export const updateGroupThunk = createAsyncThunk<
  SelectedGroup,
  {
    userGroupId: number;
    groupName?: string;
    groupDescription?: string;
    participantCount?: number;
    isActive?: boolean;
    autoReply?: boolean;
  },
  { state: RootState; rejectValue: string }
>(
  'groups/updateGroup',
  async ({ userGroupId, ...payload }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: SelectedGroup;
        message: string;
      }>(`/groups/${userGroupId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Remove group from monitoring
export const removeGroupThunk = createAsyncThunk<
  number,
  { userGroupId: number },
  { state: RootState; rejectValue: string }
>(
  'groups/removeGroup',
  async ({ userGroupId }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      await apiFetch<{ success: boolean; message: string }>(`/groups/${userGroupId}`, {
        method: 'DELETE',
        token,
      });
      return userGroupId;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Send message to group
export const sendGroupMessageThunk = createAsyncThunk<
  SendGroupMessageResponse,
  {
    deviceId: number;
    groupId: string;
    message: string;
  },
  { state: RootState; rejectValue: string }
>(
  'groups/sendGroupMessage',
  async ({ deviceId, groupId, message }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: SendGroupMessageResponse;
        message: string;
      }>(`/groups/${deviceId}/${groupId}/send`, {
        method: 'POST',
        body: JSON.stringify({ message }),
        token,
      });
      return result.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Fetch group message history
export const fetchGroupMessagesThunk = createAsyncThunk<
  {
    groupId: string;
    messages: GroupMessage[];
    pagination?: GroupPagination;
  },
  {
    userGroupId: number;
    limit?: number;
    offset?: number;
  },
  { state: RootState; rejectValue: string }
>(
  'groups/fetchGroupMessages',
  async ({ userGroupId, limit = 50, offset = 0 }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const result = await apiFetch<{
        success: boolean;
        data: GroupMessage[];
        pagination: GroupPagination;
      }>(`/groups/${userGroupId}/messages?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        token,
      });

      // Find the group to get the groupId
      const selectedGroup = state.groups.selectedGroups.find(g => g.id === userGroupId);
      if (!selectedGroup) {
        return rejectWithValue('Group not found');
      }

      return {
        groupId: selectedGroup.groupId,
        messages: result.data,
        pagination: result.pagination,
      };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Broadcast message to all selected groups
export const broadcastToGroupsThunk = createAsyncThunk<
  {
    success: boolean;
    results: Array<{
      groupId: string;
      groupName: string;
      status: 'sent' | 'failed';
      messageId?: string;
      error?: string;
    }>;
  },
  {
    message: string;
  },
  { state: RootState; rejectValue: string }
>(
  'groups/broadcastToGroups',
  async ({ message }, { getState, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;
    if (!token) return rejectWithValue('Not authenticated');

    const selectedGroups = state.groups.selectedGroups;
    if (selectedGroups.length === 0) {
      return rejectWithValue('No groups selected for broadcasting');
    }

    try {
      // Get the first group's userGroupId to use for the broadcast endpoint
      const firstGroup = selectedGroups[0];
      
      const result = await apiFetch<{
        success: boolean;
        data: {
          results: Array<{
            groupId: string;
            groupName: string;
            status: 'sent' | 'failed';
            messageId?: string;
            error?: string;
          }>;
        };
        message: string;
      }>(`/groups/${firstGroup.id}/broadcast`, {
        method: 'POST',
        body: JSON.stringify({ message }),
        token,
      });

      return {
        success: result.success,
        results: result.data.results,
      };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        return rejectWithValue((err as { message?: string }).message || 'Unknown error');
      }
      return rejectWithValue('Unknown error');
    }
  }
);
