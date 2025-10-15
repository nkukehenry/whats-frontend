"use client";
import React, { useState } from "react";
import { Plus, Trash2, Settings } from "lucide-react";
import type { MultiStepData } from "../slices/botSlice";

interface MultiStepBuilderProps {
  data: MultiStepData | undefined;
  onChange: (data: MultiStepData) => void;
}

interface StepButton {
  id: string;
  title: string;
  value: string;
}

interface MultiStep {
  id: string;
  message: string;
  inputType: 'text' | 'button' | 'number' | 'email';
  validation: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  buttons?: StepButton[];
}

export default function MultiStepBuilder({ data, onChange }: MultiStepBuilderProps) {
  const [multiStepData, setMultiStepData] = useState<MultiStepData>(data || {
    steps: [],
  });

  const updateData = (updates: Partial<MultiStepData>) => {
    const newData = { ...multiStepData, ...updates };
    setMultiStepData(newData);
    onChange(newData);
  };

  const addStep = () => {
    const newStep: MultiStep = {
      id: `step_${Date.now()}`,
      message: '',
      inputType: 'text',
      validation: { required: true },
    };
    updateData({
      steps: [...multiStepData.steps, newStep],
    });
  };

  const updateStep = (index: number, updates: Partial<MultiStep>) => {
    const newSteps = [...multiStepData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    updateData({ steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = multiStepData.steps.filter((_, i) => i !== index);
    updateData({ steps: newSteps });
  };

  const addButton = (stepIndex: number) => {
    const step = multiStepData.steps[stepIndex] as MultiStep;
    const newButton: StepButton = {
      id: `btn_${Date.now()}`,
      title: '',
      value: '',
    };
    const updatedStep = {
      ...step,
      buttons: [...(step.buttons || []), newButton],
    };
    updateStep(stepIndex, updatedStep);
  };

  const updateButton = (stepIndex: number, buttonIndex: number, updates: Partial<StepButton>) => {
    const step = multiStepData.steps[stepIndex] as MultiStep;
    const newButtons = [...(step.buttons || [])];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], ...updates };
    const updatedStep = { ...step, buttons: newButtons };
    updateStep(stepIndex, updatedStep);
  };

  const removeButton = (stepIndex: number, buttonIndex: number) => {
    const step = multiStepData.steps[stepIndex] as MultiStep;
    const newButtons = (step.buttons || []).filter((_, i) => i !== buttonIndex);
    const updatedStep = { ...step, buttons: newButtons };
    updateStep(stepIndex, updatedStep);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Conversation Steps</h4>
        <button
          onClick={addStep}
          className="text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      <div className="space-y-6">
        {multiStepData.steps.map((step, index) => {
          const stepWithButtons = step as MultiStep;
          return (
            <div key={step.id} className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-900">Step {index + 1}</span>
                <button
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={step.message}
                    onChange={(e) => updateStep(index, { message: e.target.value })}
                    placeholder="What message should be sent?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input Type
                  </label>
                  <select
                    value={step.inputType}
                    onChange={(e) => updateStep(index, { inputType: e.target.value as 'text' | 'button' | 'number' | 'email' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="button">Button Selection</option>
                  </select>
                </div>

                {/* Button Configuration - Only show when inputType is 'button' */}
                {step.inputType === 'button' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Response Buttons
                      </label>
                      <button
                        onClick={() => addButton(index)}
                        className="text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Button
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {stepWithButtons.buttons?.map((button, buttonIndex) => (
                        <div key={button.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Button {buttonIndex + 1}</span>
                            <button
                              onClick={() => removeButton(index, buttonIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={button.title}
                              onChange={(e) => updateButton(index, buttonIndex, { title: e.target.value })}
                              placeholder="Button title"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={button.value}
                              onChange={(e) => updateButton(index, buttonIndex, { value: e.target.value })}
                              placeholder="Button value"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Rules */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <label className="block text-sm font-medium text-gray-700">
                      Validation Rules
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={step.validation?.required || false}
                          onChange={(e) => updateStep(index, { 
                            validation: { ...step.validation, required: e.target.checked }
                          })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                    
                    {step.inputType === 'text' && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Min Length</label>
                          <input
                            type="number"
                            value={step.validation?.minLength || ''}
                            onChange={(e) => updateStep(index, { 
                              validation: { ...step.validation, minLength: parseInt(e.target.value) || undefined }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Max Length</label>
                          <input
                            type="number"
                            value={step.validation?.maxLength || ''}
                            onChange={(e) => updateStep(index, { 
                              validation: { ...step.validation, maxLength: parseInt(e.target.value) || undefined }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </>
                    )}
                    
                    {step.inputType === 'email' && (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Pattern (Optional)</label>
                        <input
                          type="text"
                          value={step.validation?.pattern || ''}
                          onChange={(e) => updateStep(index, { 
                            validation: { ...step.validation, pattern: e.target.value || undefined }
                          })}
                          placeholder="^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
