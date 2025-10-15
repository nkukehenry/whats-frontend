# Frontend Group Chat Implementation Guide

This guide provides detailed instructions for frontend developers on how to implement group chat functionality using the WhatsApp SaaS API.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Overview

The WhatsApp SaaS API provides comprehensive group management functionality that allows users to:
- Fetch available WhatsApp groups from their devices
- Select groups to monitor and participate in
- Send messages to selected groups
- Receive and display group message history
- Manage group settings (auto-reply, active status)

## Prerequisites

Before implementing group chat functionality, ensure you have:

1. **Backend API running** on `http://localhost:4000`
2. **User authentication** system in place
3. **Device management** functionality implemented
4. **JWT token** for API authentication

## API Endpoints

### Base URL
```
http://localhost:4000/api/v1
```

### Group Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/groups/available/{deviceId}` | Get available groups from WhatsApp | Yes |
| POST | `/groups/select` | Select a group for monitoring | Yes |
| GET | `/groups` | Get user's selected groups | Yes |
| PUT | `/groups/{userGroupId}` | Update group settings | Yes |
| DELETE | `/groups/{userGroupId}` | Remove group from monitoring | Yes |
| POST | `/groups/{deviceId}/{groupId}/send` | Send message to group | Yes |
| GET | `/groups/{userGroupId}/messages` | Get group message history | Yes |

## Authentication

All group management endpoints require Bearer token authentication:

```javascript
const headers = {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
};
```

## Response Formats

### Available Groups Response

**Endpoint:** `GET /api/v1/groups/available/{deviceId}`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "availableGroups": [
      {
        "id": "1234567890-123456@g.us",
        "name": "My Awesome Group",
        "description": "A group for discussing awesome things",
        "participantCount": 15
      }
    ],
    "selectedGroups": [
      {
        "id": 1,
        "userId": 1,
        "deviceId": 1,
        "groupId": "1234567890-123456@g.us",
        "groupName": "My Awesome Group",
        "groupDescription": "A group for discussing awesome things",
        "participantCount": 15,
        "isActive": true,
        "autoReply": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Select Group Response

**Endpoint:** `POST /api/v1/groups/select`

**Request Body:**
```json
{
  "deviceId": 1,
  "groupId": "1234567890-123456@g.us",
  "groupName": "My Awesome Group",
  "groupDescription": "A group for discussing awesome things",
  "participantCount": 15,
  "autoReply": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "deviceId": 1,
    "groupId": "1234567890-123456@g.us",
    "groupName": "My Awesome Group",
    "groupDescription": "A group for discussing awesome things",
    "participantCount": 15,
    "isActive": true,
    "autoReply": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Group selected for monitoring successfully"
}
```

### Get Selected Groups Response

**Endpoint:** `GET /api/v1/groups`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "deviceId": 1,
      "groupId": "1234567890-123456@g.us",
      "groupName": "My Awesome Group",
      "groupDescription": "A group for discussing awesome things",
      "participantCount": 15,
      "isActive": true,
      "autoReply": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Send Group Message Response

**Endpoint:** `POST /api/v1/groups/{deviceId}/{groupId}/send`

**Request Body:**
```json
{
  "message": "Hello everyone!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messageId": "sent-1705312238000",
    "status": "sent",
    "timestamp": "2024-01-15T10:30:38.000Z"
  },
  "message": "Message sent to group successfully"
}
```

### Get Group Messages Response

**Endpoint:** `GET /api/v1/groups/{groupId}/messages`

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "messageId": "ABCD1234EFGH",
      "groupId": "1234567890-123456@g.us",
      "senderId": "256771234567@s.whatsapp.net",
      "senderName": "John Doe",
      "messageType": "TEXT",
      "content": "Hello group!",
      "mediaUrl": null,
      "mediaType": null,
      "isFromMe": false,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

### Update Group Response

**Endpoint:** `PUT /api/v1/groups/{groupId}`

**Request Body:**
```json
{
  "groupName": "Updated Group Name",
  "groupDescription": "Updated description",
  "participantCount": 20,
  "isActive": true,
  "autoReply": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "deviceId": 1,
    "groupId": "1234567890-123456@g.us",
    "groupName": "Updated Group Name",
    "groupDescription": "Updated description",
    "participantCount": 20,
    "isActive": true,
    "autoReply": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Group updated successfully"
}
```

### Remove Group Response

**Endpoint:** `DELETE /api/v1/groups/{groupId}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Group removed from monitoring successfully"
}
```

## Error Handling

### Error Response Format

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Scenarios

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Device ID is required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Device not found or does not belong to user"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch groups from WhatsApp"
}
```

### Error Handling Best Practices

1. **Always check response status** before processing data
2. **Handle network errors** gracefully with retry mechanisms
3. **Display user-friendly error messages** instead of technical details
4. **Implement proper loading states** during API calls
5. **Log errors** for debugging purposes
6. **Validate input data** before sending requests

## Real-time Updates

For real-time message updates, consider implementing polling mechanisms:

### Polling Strategy

- **Frequency**: Poll every 5-10 seconds for new messages
- **Endpoint**: Use `GET /api/v1/groups/{groupId}/messages` with pagination
- **Optimization**: Only poll when the chat is active and visible
- **Error Handling**: Implement exponential backoff for failed requests

## Best Practices

### 1. State Management
- Use proper state management (Redux, Vuex, Zustand, etc.)
- Keep group data and messages in separate stores
- Implement optimistic updates for better UX

### 2. Performance Optimization
- Implement pagination for message history using `limit` and `offset` parameters
- Use virtual scrolling for large message lists
- Cache group data and messages to reduce API calls
- Debounce search and filter operations

### 3. User Experience
- Show loading states for all async operations
- Implement proper error messages and retry mechanisms
- Add message status indicators (sending, sent, failed)
- Support keyboard shortcuts (Enter to send, etc.)
- Implement infinite scroll for message history

### 4. Security
- Validate all user inputs before sending to API
- Sanitize message content to prevent XSS
- Implement rate limiting on the frontend
- Handle token expiration gracefully with automatic refresh

### 5. Accessibility
- Add proper ARIA labels for screen readers
- Support keyboard navigation
- Ensure color contrast compliance
- Provide alternative text for media messages

### 6. Testing
- Write unit tests for API integration
- Implement integration tests for group workflows
- Test error scenarios and edge cases
- Mock API responses for development and testing

### 7. Real-time Considerations
- Implement efficient polling strategies
- Use WebSocket connections when available
- Handle offline/online states gracefully
- Implement message queuing for offline scenarios

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if the JWT token is valid and properly formatted
2. **404 Not Found**: Verify the device ID exists and belongs to the user
3. **500 Internal Server Error**: Check backend logs for specific error details
4. **CORS Issues**: Ensure the backend allows your frontend domain
5. **Rate Limiting**: Implement proper request throttling

### Debug Tips

1. Use browser developer tools to inspect network requests
2. Check the API documentation at `http://localhost:4000/docs`
3. Verify JWT token expiration
4. Test API endpoints directly using tools like Postman or curl
5. Check browser console for JavaScript errors

## Support

For additional support:
- Check the API documentation at `http://localhost:4000/docs`
- Review the backend logs for error details
- Test endpoints using the Swagger UI interface
- Contact the backend development team for API-related issues

---

This guide provides a comprehensive foundation for implementing group chat functionality. The response formats shown above directly reflect the actual API responses from the backend implementation.
