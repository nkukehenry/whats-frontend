"use client";
import React from "react";
import Sidebar from "../../components/Sidebar";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeTab="help" />
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          <h1 className="text-3xl font-bold text-green-700 mb-4">Help & Support</h1>
          <p className="mb-6 text-gray-700 text-lg">
            Need help? Contact us at <a href="mailto:info@mutindo.com" className="text-green-700 underline">info@mutindo.com</a>
          </p>
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Add a Device</h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-1">
                <li>Go to <span className="font-mono">My Devices</span> and click <span className="font-mono">Add Device</span>.</li>
                <li>Enter a device name and your WhatsApp number (with country code).</li>
                <li>Click <span className="font-mono">Generate QR Code</span>.</li>
                <li>Open WhatsApp on your phone, go to <span className="font-mono">Linked Devices</span>, and scan the QR code.</li>
                <li>Once connected, your device will appear in the list and be ready to use.</li>
              </ol>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Remove a Device</h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-1">
                <li>Go to <span className="font-mono">My Devices</span>.</li>
                <li>Find the device you want to remove.</li>
                <li>Click the <span className="font-mono">Remove</span> (trash/bin) button next to the device.</li>
                <li>Confirm the removal in the popup dialog.</li>
                <li>The device will be removed from your account.</li>
              </ol>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Send a Message</h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-1">
                <li>Go to <span className="font-mono">Single Send</span> from the sidebar.</li>
                <li>Select the device you want to send from.</li>
                <li>Enter the recipient&apos;s WhatsApp number (with country code) and your message.</li>
                <li>Click <span className="font-mono">Send</span>.</li>
                <li>You will see a confirmation when the message is sent successfully.</li>
              </ol>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Notes on Sending Bulk Messages</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Bulk messages allow you to send the same message to multiple WhatsApp numbers at once.</li>
                <li>Always include the country code for each recipient (e.g., <span className="font-mono">+256777245670</span>).</li>
                <li>For best results, keep your message concise and avoid spammy content.</li>
                <li>Some numbers may not receive messages if they are not registered on WhatsApp or have privacy settings enabled.</li>
                <li>There may be rate limits to prevent abuse. If you have a large list, consider sending in smaller batches.</li>
                <li>You can upload a file with numbers or paste them directly, depending on the interface.</li>
                <li>Check the delivery status for each recipient after sending.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 