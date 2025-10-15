"use client";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { QuickReplyData, QuickReplyButton } from "../slices/botSlice";

interface QuickReplyBuilderProps {
  data: QuickReplyData | undefined;
  onChange: (data: QuickReplyData) => void;
}

export default function QuickReplyBuilder({ data, onChange }: QuickReplyBuilderProps) {
  const [quickReplyData, setQuickReplyData] = useState<QuickReplyData>(data || {
    body: { text: '' },
    buttons: [],
  });

  const updateData = (updates: Partial<QuickReplyData>) => {
    const newData = { ...quickReplyData, ...updates };
    setQuickReplyData(newData);
    onChange(newData);
  };

  const addButton = () => {
    const newButton = {
      id: `btn_${Date.now()}`,
      title: '',
      description: '',
    };
    updateData({
      buttons: [...quickReplyData.buttons, newButton],
    });
  };

  const updateButton = (index: number, updates: Partial<QuickReplyButton>) => {
    const newButtons = [...quickReplyData.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    updateData({ buttons: newButtons });
  };

  const removeButton = (index: number) => {
    const newButtons = quickReplyData.buttons.filter((_, i) => i !== index);
    updateData({ buttons: newButtons });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Header Text (Optional)
        </label>
        <input
          type="text"
          value={quickReplyData.header?.text || ''}
          onChange={(e) => updateData({ header: { type: 'text', text: e.target.value } })}
          placeholder="Welcome! How can I help you?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Body Text
        </label>
        <textarea
          value={quickReplyData.body.text}
          onChange={(e) => updateData({ body: { text: e.target.value } })}
          placeholder="Please select an option:"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer Text (Optional)
        </label>
        <input
          type="text"
          value={quickReplyData.footer?.text || ''}
          onChange={(e) => updateData({ footer: { text: e.target.value } })}
          placeholder="Reply with the number of your choice"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Quick Reply Buttons
          </label>
          <button
            onClick={addButton}
            className="text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Button
          </button>
        </div>

        <div className="space-y-3">
          {quickReplyData.buttons.map((button, index) => (
            <div key={button.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Button {index + 1}</span>
                <button
                  onClick={() => removeButton(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={button.title}
                  onChange={(e) => updateButton(index, { title: e.target.value })}
                  placeholder="Button title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={button.description || ''}
                  onChange={(e) => updateButton(index, { description: e.target.value })}
                  placeholder="Button description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

