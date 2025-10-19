import React, { useState, useEffect } from 'react';
import { 
  usePresets, 
  useCreatePreset, 
  useUpdatePreset, 
  useDeletePreset 
} from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Preset } from '@/types/api';
import { PresetCard } from '@/components/presets/PresetCard';
import { PresetForm } from '@/components/presets/PresetForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Plus, 
  Bot, 
  RefreshCw,
  Trash2,
} from 'lucide-react';

type ModalType = 'create' | 'edit' | 'delete' | null;

export const PresetManagement: React.FC = () => {
  const { subscribe } = useWebSocket();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  // API hooks
  const { 
    data: presets = [], 
    isLoading: presetsLoading, 
    refetch: refetchPresets,
    error: presetsError
  } = usePresets();

  const { mutate: createPreset, isPending: createLoading } = useCreatePreset();
  const { mutate: updatePreset, isPending: updateLoading } = useUpdatePreset();
  const { mutate: deletePreset, isPending: deleteLoading } = useDeletePreset();

  // Real-time updates
  useEffect(() => {
    const handlePresetChanged = () => {
      refetchPresets();
    };

    const handlePresetDeleted = () => {
      refetchPresets();
    };

    subscribe('preset_changed', handlePresetChanged);
    subscribe('preset_deleted', handlePresetDeleted);

    return () => {
      // Cleanup handled by useWebSocket hook
    };
  }, [subscribe, refetchPresets]);

  // Filter presets based on search query
  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.tone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    preset.verbosity?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort presets: default first, then by name
  const sortedPresets = [...filteredPresets].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleCreatePreset = (data: any) => {
    createPreset(data, {
      onSuccess: () => {
        setModalType(null);
        refetchPresets();
      },
      onError: (error) => {
        console.error('Failed to create preset:', error);
        // TODO: Show error toast
      },
    });
  };

  const handleUpdatePreset = (data: any) => {
    if (!selectedPreset) return;

    updatePreset(
      { presetId: selectedPreset.id, preset: data },
      {
        onSuccess: () => {
          setModalType(null);
          setSelectedPreset(null);
          refetchPresets();
        },
        onError: (error) => {
          console.error('Failed to update preset:', error);
          // TODO: Show error toast
        },
      }
    );
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;

    deletePreset(selectedPreset.id, {
      onSuccess: () => {
        setModalType(null);
        setSelectedPreset(null);
        refetchPresets();
      },
      onError: (error) => {
        console.error('Failed to delete preset:', error);
        // TODO: Show error toast
      },
    });
  };

  const handleSetDefault = (preset: Preset) => {
    updatePreset(
      { 
        presetId: preset.id, 
        preset: { is_default: true } 
      },
      {
        onSuccess: () => {
          refetchPresets();
        },
        onError: (error) => {
          console.error('Failed to set default preset:', error);
          // TODO: Show error toast
        },
      }
    );
  };

  const openEditModal = (preset: Preset) => {
    setSelectedPreset(preset);
    setModalType('edit');
  };

  const openDeleteModal = (preset: Preset) => {
    setSelectedPreset(preset);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPreset(null);
  };

  const handleRefresh = () => {
    refetchPresets();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (presetsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presets</h1>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-red-600">Error loading presets. Please try again.</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage bot personality presets and behavior settings
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={presetsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${presetsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setModalType('create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Preset
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={handleClearSearch}
          />
        </div>
        <div className="text-sm text-gray-500">
          {sortedPresets.length} of {presets.length} presets
        </div>
      </div>

      {/* Presets Grid */}
      <div>
        {presetsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : sortedPresets.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {presets.length === 0 ? 'No presets yet' : 'No presets found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {presets.length === 0 
                ? 'Get started by creating your first preset'
                : 'Try adjusting your search terms'
              }
            </p>
            {presets.length === 0 && (
              <div className="mt-6">
                <Button onClick={() => setModalType('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Preset
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onEdit={() => openEditModal(preset)}
                onDelete={() => openDeleteModal(preset)}
                onSetDefault={() => handleSetDefault(preset)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalType === 'create' || modalType === 'edit'}
        onClose={closeModal}
        title={modalType === 'create' ? 'Create New Preset' : 'Edit Preset'}
        size="lg"
      >
        <PresetForm
          preset={modalType === 'edit' ? selectedPreset || undefined : undefined}
          onSubmit={modalType === 'create' ? handleCreatePreset : handleUpdatePreset}
          onCancel={closeModal}
          loading={createLoading || updateLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Delete Preset"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                Delete "{selectedPreset?.name}"?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. The preset will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={closeModal} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePreset}
              loading={deleteLoading}
              disabled={deleteLoading}
            >
              Delete Preset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};