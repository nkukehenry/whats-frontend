"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import Sidebar from "../../../../components/Sidebar";
import { 
  fetchGroupMessagesThunk,
  sendGroupMessageThunk 
} from "../../../../slices/groupThunks";
import { clearError, setGroupMessages } from "../../../../slices/groupSlice";
import {
  ArrowLeft,
  Send,
  RefreshCw,
  MessageSquare,
  Users,
  Clock,
  Loader2,
} from "lucide-react";

export default function GroupChatPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedGroups } = useAppSelector((state) => state.groups);
  const { 
    messages,
    sendingMessage,
    fetchingMessages,
    error 
  } = useAppSelector((state) => state.groups);

  const [newMessage, setNewMessage] = useState("");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const groupId = Number(params.id);
  const group = selectedGroups.find(g => g.id === groupId);
  const groupMessages = React.useMemo(() => {
    return group ? messages[group.groupId] || [] : [];
  }, [group, messages]);

  useEffect(() => {
    if (user && groupId && group) {
      // Fetch initial messages
      dispatch(fetchGroupMessagesThunk({ userGroupId: groupId })).then((result) => {
        if (fetchGroupMessagesThunk.fulfilled.match(result)) {
          dispatch(setGroupMessages({ groupId: result.payload.groupId, messages: result.payload.messages }));
        }
      });
    }
  }, [user, groupId, group, dispatch]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  useEffect(() => {
    // Start polling for new messages every 5 seconds
    if (groupId && group) {
      const interval = setInterval(() => {
        dispatch(fetchGroupMessagesThunk({ userGroupId: groupId })).then((result) => {
          if (fetchGroupMessagesThunk.fulfilled.match(result)) {
            dispatch(setGroupMessages({ groupId: result.payload.groupId, messages: result.payload.messages }));
          }
        });
      }, 5000);
      setPollingInterval(interval);

      return () => {
        clearInterval(interval);
        setPollingInterval(null);
      };
    }
  }, [groupId, group, dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !group || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      await dispatch(sendGroupMessageThunk({
        deviceId: group.deviceId,
        groupId: group.groupId,
        message: messageText,
      })).unwrap();
      
      // Refresh messages after sending
      dispatch(fetchGroupMessagesThunk({ userGroupId: groupId })).then((result) => {
        if (fetchGroupMessagesThunk.fulfilled.match(result)) {
          dispatch(setGroupMessages({ groupId: result.payload.groupId, messages: result.payload.messages }));
        }
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(messageText); // Restore message on error
    }
  };

  const handleRefreshMessages = () => {
    if (groupId && group) {
      dispatch(fetchGroupMessagesThunk({ userGroupId: groupId })).then((result) => {
        if (fetchGroupMessagesThunk.fulfilled.match(result)) {
          dispatch(setGroupMessages({ groupId: result.payload.groupId, messages: result.payload.messages }));
        }
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'IMAGE':
        return '🖼️';
      case 'VIDEO':
        return '🎥';
      case 'AUDIO':
        return '🎵';
      case 'DOCUMENT':
        return '📄';
      default:
        return '💬';
    }
  };

  if (!user) {
    return null;
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar activeTab="groups" showBackButton backButtonText="Back to Groups" onBackClick={() => router.push('/groups')} />
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Group not found</h3>
                <p className="text-gray-600 mb-6">
                  The group you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <button
                  onClick={() => router.push('/groups')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Groups
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab="groups" showBackButton backButtonText="Back to Groups" onBackClick={() => router.push('/groups')} />
        
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {group.groupName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{group.groupName}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.participantCount} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${pollingInterval ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span>{pollingInterval ? 'Live' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshMessages}
                  disabled={fetchingMessages}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${fetchingMessages ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Loading State */}
              {fetchingMessages && groupMessages.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    <span className="text-gray-600">Loading messages...</span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!fetchingMessages && groupMessages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">
                    Start a conversation by sending a message below
                  </p>
                </div>
              )}

              {/* Messages List */}
              {groupMessages.length > 0 && (
                <div className="space-y-4">
                  {groupMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.isFromMe
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        {/* Message Header */}
                        {!message.isFromMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-600">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                        )}

                        {/* Message Content */}
                        <div className="flex items-start gap-2">
                          {message.messageType !== 'TEXT' && (
                            <span className="text-lg flex-shrink-0">
                              {getMessageTypeIcon(message.messageType)}
                            </span>
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed break-words">
                              {message.content}
                            </p>
                            {message.mediaUrl && (
                              <div className="mt-2">
                                <a
                                  href={message.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs underline hover:no-underline"
                                >
                                  View {message.mediaType || 'media'}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Message Footer */}
                        <div className={`flex items-center justify-end mt-2 gap-1 ${
                          message.isFromMe ? 'text-green-100' : 'text-gray-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-end gap-4">
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{
                      minHeight: '48px',
                      maxHeight: '120px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
