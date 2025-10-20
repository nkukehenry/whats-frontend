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
          <p className="text-lg text-gray-600 mb-8"><strong>Base URL: </strong>https://api.bulkoms.com</p> 

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

          {/* Media Files Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sending Media Files</h2>
            <div className="mb-2 text-sm text-gray-500">POST <span className="font-mono text-green-700">/api/v1/messages/send</span></div>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Request Body (multipart/form-data):
{
  "to": "+1234567890",
  "message": "Check out this image!",
  "media": <FILE_UPLOAD>,
  "mediaType": "image/jpeg",
  "deviceId": 49
}

Alternative with media URL:
{
  "to": "+1234567890",
  "message": "Check out this image!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image/jpeg",
  "deviceId": 49
}`}
              </pre>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Response (JSON):
{
  "success": true,
  "data": {
    "id": 123,
    "to": "+1234567890",
    "message": "Check out this image!",
    "status": "SENT",
    "mediaUrl": "https://api.example.com/media/abc123.jpg",
    "mediaType": "image/jpeg",
    "sentAt": "2024-01-15T10:30:00Z",
    "deviceId": 49
  }
}`}
              </pre>
            </div>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-2">
              <li><span className="font-mono">to</span>: Recipient phone number with country code</li>
              <li><span className="font-mono">message</span>: Caption text for the media (optional)</li>
              <li><span className="font-mono">media</span>: File upload (multipart/form-data)</li>
              <li><span className="font-mono">mediaUrl</span>: Direct URL to media file (alternative to file upload)</li>
              <li><span className="font-mono">mediaType</span>: MIME type (image/jpeg, image/png, video/mp4, audio/mp3, application/pdf)</li>
              <li><span className="font-mono">deviceId</span>: WhatsApp device ID to send from</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-yellow-900 mb-2">📎 Supported Media Types:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>Images:</strong> JPEG, PNG, GIF (max 5MB)</li>
                <li>• <strong>Videos:</strong> MP4, MOV, AVI (max 16MB)</li>
                <li>• <strong>Audio:</strong> MP3, WAV, OGG (max 16MB)</li>
                <li>• <strong>Documents:</strong> PDF, DOC, DOCX, XLS, XLSX (max 100MB)</li>
                <li>• <strong>Stickers:</strong> WebP format (max 1MB)</li>
              </ul>
            </div>
          </section>

          {/* API Bot Media Response Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">API Bot Media Responses</h2>
            <div className="mb-4 text-gray-600">
              When configuring API bots, you can return media files in your API response. 
              The bot will automatically send the media to the user.
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-3">API Response Format</h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
{`Your API Response (JSON):
{
  "success": true,
  "response": {
    "reply": "Here&apos;s your requested image!",
    "media": "https://your-api.com/images/weather-report.jpg",
    "mediaType": "image/jpeg"
  }
}`}
              </pre>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Media Response Fields</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm mb-4">
              <li><span className="font-mono">reply</span>: Text message to send with the media (caption)</li>
              <li><span className="font-mono">media</span>: URL to the media file (must be publicly accessible)</li>
              <li><span className="font-mono">mediaType</span>: MIME type of the media file (required for proper handling)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Example API Bot Endpoints</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🌤️ Weather Bot Example</h4>
                <pre className="text-sm text-blue-800 whitespace-pre-wrap">
{`User: "weather New York"
Bot Response:
{
  "success": true,
  "response": {
    "reply": "Current weather in New York: 22°C, partly cloudy",
    "media": "https://weather-api.com/charts/nyc-weather.png",
    "mediaType": "image/png"
  }
}`}
                </pre>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">📊 Analytics Bot Example</h4>
                <pre className="text-sm text-green-800 whitespace-pre-wrap">
{`User: "sales report"
Bot Response:
{
  "success": true,
  "response": {
    "reply": "Here&apos;s your monthly sales report",
    "media": "https://analytics-api.com/reports/monthly-sales.pdf",
    "mediaType": "application/pdf"
  }
}`}
                </pre>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">🎵 Music Bot Example</h4>
                <pre className="text-sm text-purple-800 whitespace-pre-wrap">
{`User: "play song happy birthday"
Bot Response:
{
  "success": true,
  "response": {
    "reply": "🎵 Here&apos;s &quot;Happy Birthday&quot; for you!",
    "media": "https://music-api.com/songs/happy-birthday.mp3",
    "mediaType": "audio/mp3"
  }
}`}
                </pre>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Requirements:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Media URLs must be publicly accessible (no authentication required)</li>
                <li>• URLs must use HTTPS (HTTP is not supported for security)</li>
                <li>• Media files must be within size limits (see media types above)</li>
                <li>• Your API should return appropriate HTTP status codes (200 for success)</li>
                <li>• Media files are cached temporarily for faster delivery</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Always include a text reply with media for better user experience</li>
                <li>• Use appropriate media types for optimal compression and quality</li>
                <li>• Consider generating media on-demand to save storage costs</li>
                <li>• Test your media URLs to ensure they&apos;re accessible from external sources</li>
                <li>• Use CDN services for better media delivery performance</li>
              </ul>
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