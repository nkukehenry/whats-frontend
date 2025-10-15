"use client";
import React, { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import type { ConditionalData } from "../slices/botSlice";

interface ConditionalBuilderProps {
  data: ConditionalData | undefined;
  onChange: (data: ConditionalData) => void;
}

export default function ConditionalBuilder({ data, onChange }: ConditionalBuilderProps) {
  const [conditionalData, setConditionalData] = useState<ConditionalData>(data || {
    conditions: [],
    responses: [],
  });

  const updateData = (updates: Partial<ConditionalData>) => {
    const newData = { ...conditionalData, ...updates };
    setConditionalData(newData);
    onChange(newData);
  };

  const addCondition = () => {
    const newCondition = {
      field: 'message',
      operator: 'contains' as const,
      value: '',
    };
    updateData({
      conditions: [...conditionalData.conditions, newCondition],
    });
  };

  const updateCondition = (index: number, updates: Partial<typeof conditionalData.conditions[0]>) => {
    const newConditions = [...conditionalData.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    updateData({ conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = conditionalData.conditions.filter((_, i) => i !== index);
    updateData({ conditions: newConditions });
  };

  const addResponse = () => {
    const newResponse = {
      condition: '',
      response: '',
    };
    updateData({
      responses: [...conditionalData.responses, newResponse],
    });
  };

  const updateResponse = (index: number, updates: Partial<typeof conditionalData.responses[0]>) => {
    const newResponses = [...conditionalData.responses];
    newResponses[index] = { ...newResponses[index], ...updates };
    updateData({ responses: newResponses });
  };

  const removeResponse = (index: number) => {
    const newResponses = conditionalData.responses.filter((_, i) => i !== index);
    updateData({ responses: newResponses });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Conditional Response Builder</h4>
        <p className="text-gray-600">Create responses that change based on message content or user conditions</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Conditions</h4>
            <button
              onClick={addCondition}
              className="text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Condition
            </button>
          </div>
          
          <div className="space-y-3">
            {conditionalData.conditions.map((condition, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Condition {index + 1}</span>
                  <button
                    onClick={() => removeCondition(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(index, { field: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="message">Message</option>
                    <option value="contact">Contact</option>
                    <option value="time">Time</option>
                  </select>
                  
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="startsWith">Starts With</option>
                    <option value="endsWith">Ends With</option>
                    <option value="regex">Regex</option>
                  </select>
                  
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    placeholder="Value to match"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Responses</h4>
            <button
              onClick={addResponse}
              className="text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Response
            </button>
          </div>
          
          <div className="space-y-3">
            {conditionalData.responses.map((response, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Response {index + 1}</span>
                  <button
                    onClick={() => removeResponse(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={response.condition}
                    onChange={(e) => updateResponse(index, { condition: e.target.value })}
                    placeholder="Condition identifier"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  
                  <textarea
                    value={response.response}
                    onChange={(e) => updateResponse(index, { response: e.target.value })}
                    placeholder="Response text"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
