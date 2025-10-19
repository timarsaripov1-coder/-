import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Preset, PresetCreate, PresetUpdate } from '@/types/api';

interface PresetFormProps {
  preset?: Preset;
  onSubmit: (data: PresetCreate | PresetUpdate) => void;
  onCancel: () => void;
  loading?: boolean;
}

const toneOptions = [
  { value: '', label: 'No specific tone' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'serious', label: 'Serious' },
];

const verbosityOptions = [
  { value: '', label: 'Default verbosity' },
  { value: 'concise', label: 'Concise' },
  { value: 'normal', label: 'Normal' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'verbose', label: 'Verbose' },
];

export const PresetForm: React.FC<PresetFormProps> = ({
  preset,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    temperature: 0.7,
    max_tokens: 600,
    tone: '',
    verbosity: '',
    emotional_intensity: 50,
    system_prompt_override: '',
    is_default: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load preset data when editing
  useEffect(() => {
    if (preset) {
      setFormData({
        name: preset.name,
        description: preset.description || '',
        temperature: Number(preset.temperature) || 0.7,
        max_tokens: preset.max_tokens || 600,
        tone: preset.tone || '',
        verbosity: preset.verbosity || '',
        emotional_intensity: preset.emotional_intensity || 50,
        system_prompt_override: preset.system_prompt_override || '',
        is_default: preset.is_default,
      });
    }
  }, [preset]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = 'Temperature must be between 0 and 2';
    }

    if (formData.max_tokens < 1 || formData.max_tokens > 4000) {
      newErrors.max_tokens = 'Max tokens must be between 1 and 4000';
    }

    if (formData.emotional_intensity < 0 || formData.emotional_intensity > 100) {
      newErrors.emotional_intensity = 'Emotional intensity must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      description: formData.description || undefined,
      tone: formData.tone || undefined,
      verbosity: formData.verbosity || undefined,
      system_prompt_override: formData.system_prompt_override || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <Input
          label="Name *"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter preset name..."
          error={errors.name}
          disabled={loading}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe this preset..."
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Parameters */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Parameters</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {formData.temperature}
            </label>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', Number(e.target.value))}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher values make output more random
            </p>
          </div>

          <Input
            label="Max Tokens"
            type="number"
            min={1}
            max={4000}
            value={formData.max_tokens}
            onChange={(e) => handleInputChange('max_tokens', Number(e.target.value))}
            error={errors.max_tokens}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tone"
            value={formData.tone}
            onChange={(e) => handleInputChange('tone', e.target.value)}
            options={toneOptions}
            disabled={loading}
          />

          <Select
            label="Verbosity"
            value={formData.verbosity}
            onChange={(e) => handleInputChange('verbosity', e.target.value)}
            options={verbosityOptions}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emotional Intensity: {formData.emotional_intensity}%
          </label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={formData.emotional_intensity}
            onChange={(e) => handleInputChange('emotional_intensity', Number(e.target.value))}
            suffix="%"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            How emotionally expressive the bot should be
          </p>
        </div>
      </div>

      {/* Advanced */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Advanced</h4>
        
        <Textarea
          label="System Prompt Override"
          value={formData.system_prompt_override}
          onChange={(e) => handleInputChange('system_prompt_override', e.target.value)}
          placeholder="Custom system prompt to override default behavior..."
          rows={4}
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Leave empty to use the default system prompt
        </p>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_default"
            checked={formData.is_default}
            onChange={(e) => handleInputChange('is_default', e.target.checked)}
            disabled={loading}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="is_default" className="text-sm text-gray-700">
            Set as default preset
          </label>
        </div>
        <p className="text-xs text-gray-500">
          The default preset will be used for new chats
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {preset ? 'Update Preset' : 'Create Preset'}
        </Button>
      </div>
    </form>
  );
};