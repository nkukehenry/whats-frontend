// Types for group management functionality
export interface AvailableGroup {
  id: string;
  name: string;
  description: string;
  participantCount: number;
}

export interface SelectedGroup {
  id: number;
  userId: number;
  deviceId: number;
  groupId: string;
  groupName: string;
  groupDescription: string;
  participantCount: number;
  isActive: boolean;
  autoReply: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  id: number;
  messageId: string;
  groupId: string;
  senderId: string;
  senderName: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  isFromMe: boolean;
  timestamp: string;
  createdAt: string;
}

export interface SendGroupMessageResponse {
  messageId: string;
  status: 'sent' | 'failed';
  timestamp: string;
}

export interface GroupPagination {
  limit: number;
  offset: number;
  count: number;
}

export interface AvailableGroupsData {
  availableGroups: AvailableGroup[];
  selectedGroups: SelectedGroup[];
}
