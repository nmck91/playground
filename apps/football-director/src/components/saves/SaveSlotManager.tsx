/**
 * Save Slot Manager Component
 * Main save management screen with grid of 5 slots
 */

'use client';

import { useState, useEffect } from 'react';
import { SaveService } from '../../services/SaveService';
import { SaveSlotCard } from './SaveSlotCard';
import { SaveMetadata } from '@playground/football-director-engine';

export interface SaveSlotManagerProps {
  onLoadSlot: (slotId: number) => void;
  onCreateNew: (saveName?: string) => void;
}

export function SaveSlotManager({ onLoadSlot, onCreateNew }: SaveSlotManagerProps) {
  const [slots, setSlots] = useState<{ [slotId: number]: SaveMetadata }>({});
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [newGameName, setNewGameName] = useState('');

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = () => {
    const allSaves = SaveService.getAllSaves();
    const metadata: { [slotId: number]: SaveMetadata } = {};

    Object.keys(allSaves).forEach((slotId) => {
      const slot = allSaves[parseInt(slotId, 10)];
      if (slot) {
        metadata[parseInt(slotId, 10)] = slot.metadata;
      }
    });

    setSlots(metadata);
    setActiveSlot(SaveService.getActiveSlot());
  };

  const handleLoad = (slotId: number) => {
    SaveService.setActiveSlot(slotId);
    onLoadSlot(slotId);
  };

  const handleDelete = (slotId: number) => {
    if (confirm(`Are you sure you want to delete this save?`)) {
      SaveService.deleteSlot(slotId);
      loadSlots();
    }
  };

  const handleRename = (slotId: number, newName: string) => {
    SaveService.renameSlot(slotId, newName);
    loadSlots();
  };

  const handleExport = (slotId: number) => {
    const jsonString = SaveService.exportSave(slotId);
    if (!jsonString) {
      alert('Failed to export save');
      return;
    }

    // Create download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `football-director-save-${slotId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      setImportError(null);
      const slotId = SaveService.importSave(importText);
      setShowImportDialog(false);
      setImportText('');
      loadSlots();
      alert(`Save imported successfully to slot ${slotId}`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import save');
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const handleNewGame = () => {
    try {
      const name = newGameName.trim() || undefined;
      onCreateNew(name);
      setShowNewGameDialog(false);
      setNewGameName('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create new game');
    }
  };

  const hasEmptySlot = Object.keys(slots).length < 5;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-teal-500 text-cream-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold">⚽ Football Director</h1>
          <p className="text-teal-100 mt-2">Save Management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowNewGameDialog(true)}
              disabled={!hasEmptySlot}
              className={`px-6 py-3 rounded-lg font-medium shadow-sm transition-colors ${
                hasEmptySlot
                  ? 'bg-teal-500 hover:bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={!hasEmptySlot ? 'All save slots are full. Delete a save first.' : ''}
            >
              + New Game
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              disabled={!hasEmptySlot}
              className={`px-6 py-3 rounded-lg font-medium shadow-sm transition-colors ${
                hasEmptySlot
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={!hasEmptySlot ? 'All save slots are full. Delete a save first.' : ''}
            >
              Import Save
            </button>
          </div>
          {!hasEmptySlot && (
            <div className="mt-4 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-3">
              All save slots are full (5/5). Delete a save to create a new one or import a save.
            </div>
          )}
        </div>

        {/* Save Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((slotId) => (
            <SaveSlotCard
              key={slotId}
              slotId={slotId}
              metadata={slots[slotId]}
              onLoad={handleLoad}
              onDelete={handleDelete}
              onRename={handleRename}
              onExport={handleExport}
              isActive={activeSlot === slotId}
            />
          ))}
        </div>
      </main>

      {/* New Game Dialog */}
      {showNewGameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Create New Game</h3>
            <p className="text-slate-700 mb-4">
              Give your save a name (optional):
            </p>
            <input
              type="text"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNewGame();
                if (e.key === 'Escape') {
                  setShowNewGameDialog(false);
                  setNewGameName('');
                }
              }}
              placeholder="My Save"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6"
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowNewGameDialog(false);
                  setNewGameName('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-900 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewGame}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Import Save</h3>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload save file:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Or paste JSON */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Or paste save data (JSON):
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste save JSON here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm h-32"
              />
            </div>

            {importError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                {importError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportText('');
                  setImportError(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-900 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors ${
                  importText.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
