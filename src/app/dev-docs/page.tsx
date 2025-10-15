"use client";
import React from "react";
import Sidebar from "../../components/Sidebar";

export default function DevDocsPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeTab="dev-docs" />
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          <h1 className="text-4xl font-bold text-green-700 mb-2">Developer API Docs</h1>
          <p className="text-lg text-gray-600 mb-8">Integrate WhatsApp messaging into your app with our simple API.</p>

          {/* Login Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login</h2>
            <div className="mb-2 text-sm text-gray-500">POST <span className="font-mono text-green-700">/api/v1/auth/login</span></div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Request Body (JSON):
{
  "email": "user@example.com",
  "password": "yourPassword123!"
}`}
              </pre>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Response (JSON):
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>",
  "requiresOTP": false
}`}
              </pre>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-2">
              <li><span className="font-mono">email</span>: User email address</li>
              <li><span className="font-mono">password</span>: User password</li>
            </ul>
          </section>

          {/* Refresh Token Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Refresh Token</h2>
            <div className="mb-2 text-sm text-gray-500">POST <span className="font-mono text-green-700">/api/v1/auth/refresh</span></div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Request Body (JSON):
{
  "refreshToken": "<REFRESH_TOKEN>"
}`}
              </pre>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Response (JSON):
{
  "success": true,
  "token": "<NEW_JWT_TOKEN>",
  "refreshToken": "<NEW_REFRESH_TOKEN>"
}`}
              </pre>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-2">
              <li><span className="font-mono">refreshToken</span>: The refresh token received from login</li>
            </ul>
          </section>

          {/* Fetch Devices Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Fetch Devices</h2>
            <div className="mb-2 text-sm text-gray-500">GET <span className="font-mono text-green-700">/api/v1/devices/list</span></div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Request Headers:
Authorization: Bearer <JWT_TOKEN>`}
              </pre>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Response (JSON):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My iPhone",
      "waNumber": "+256777245670",
      "isActive": true,
      "createdAt": "2024-05-01T12:34:56Z"
    },
    // ...more devices
  ]
}`}
              </pre>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-2">
              <li><span className="font-mono">Authorization</span>: Bearer token required in headers</li>
            </ul>
          </section>

          {/* Send Message Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Send Message</h2>
            <div className="mb-2 text-sm text-gray-500">POST <span className="font-mono text-green-700">/api/v1/messages/send</span></div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Request Body (JSON):
{
  "to": "+256777245670",
  "message": "Hello from the API!",
  "deviceId": 1
}`}
              </pre>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Response (JSON):
{
  "success": true,
  "messageId": 12345,
  "status": "SENT"
}`}
              </pre>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-2">
              <li><span className="font-mono">to</span>: Recipient WhatsApp number (with country code)</li>
              <li><span className="font-mono">message</span>: Message text to send</li>
              <li><span className="font-mono">deviceId</span>: (optional) Device to send from</li>
            </ul>
          </section>

          {/* Send Bulk Message Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Send Bulk Messages</h2>
            <div className="mb-2 text-sm text-gray-500">POST <span className="font-mono text-green-700">/api/v1/messages/send-bulk</span></div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Request Body (JSON):
{
  "recipients": [
    "+256777245670",
    "+256701234567"
  ],
  "message": "Hello, this is a bulk message!",
  "deviceId": 1
}`}
              </pre>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Response (JSON):
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "message": "Bulk messages sent successfully."
}`}
              </pre>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-2">
              <li><span className="font-mono">recipients</span>: Array of WhatsApp numbers (with country code)</li>
              <li><span className="font-mono">message</span>: Message text to send</li>
              <li><span className="font-mono">deviceId</span>: (optional) Device to send from</li>
            </ul>
          </section>

          {/* Broadcast to Groups Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Broadcast to Selected Groups</h2>
            <div className="mb-2 text-sm text-gray-500">POST <span className="font-mono text-green-700">/api/v1/groups/&#123;userGroupId&#125;/broadcast</span></div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Request Headers:
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body (JSON):
{
  "message": "Hello to all my selected groups!"
}`}
              </pre>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Response (JSON):
{
  "success": true,
  "data": {
    "results": [
      {
        "groupId": "1234567890-123456@g.us",
        "groupName": "My Awesome Group",
        "status": "sent",
        "messageId": "sent-1705312238000"
      },
      {
        "groupId": "0987654321-654321@g.us",
        "groupName": "Another Group",
        "status": "failed",
        "error": "Group not accessible"
      }
    ]
  },
  "message": "Broadcast completed with results"
}`}
              </pre>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-2">
              <li><span className="font-mono">userGroupId</span>: Any user group ID (used to identify the user&apos;s selected groups)</li>
              <li><span className="font-mono">message</span>: Message text to broadcast to all selected groups</li>
              <li><span className="font-mono">Authorization</span>: Bearer token required in headers</li>
              <li><span className="font-mono">results</span>: Array showing status for each group (sent/failed)</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 How it works:</h4>
              <p className="text-sm text-blue-800">
                This endpoint sends the same message to all groups that the user has selected for monitoring. 
                It uses any userGroupId to identify the user, then broadcasts to all their selected groups.
              </p>
            </div>
          </section>

          <div className="mt-8 text-center text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} WhatsApp SaaS API &mdash; For developers
          </div>
        </div>
      </main>
    </div>
  );
} 