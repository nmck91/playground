/**
 * Save Slot Card Component
 * Displays a single save slot with metadata and actions
 */

'use client';

import { SaveMetadata } from '@playground/football-director-engine';
import { useState } from 'react';

export interface SaveSlotCardProps {
  slotId: number;
  metadata?: SaveMetadata;
  onLoad: (slotId: number) => void;
  onDelete: (slotId: number) => void;
  onRename: (slotId: number, newName: string) => void;
  onExport: (slotId: number) => void;
  isActive: boolean;
}

export function SaveSlotCard({
  slotId,
  metadata,
  onLoad,
  onDelete,
  onRename,
  onExport,
  isActive,
}: SaveSlotCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(metadata?.saveName || `Save ${slotId}`);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRenameSubmit = () => {
    if (newName.trim()) {
      onRename(slotId, newName.trim());
      setIsRenaming(false);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(slotId);
    setShowDeleteConfirm(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPositionSuffix = (pos: number) => {
    if (pos >= 11 && pos <= 13) return 'th';
    const lastDigit = pos % 10;
    switch (lastDigit) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  // Empty slot
  if (!metadata) {
    return (
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-teal-400 dark:hover:border-teal-500 transition-colors bg-white dark:bg-dark-bg-secondary">
        <div className="text-center">
          <div className="text-4xl mb-3">📁</div>
          <div className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Slot {slotId}</div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">Empty</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 rounded-lg p-6 transition-all ${
        isActive
          ? 'border-teal-500 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20'
          : 'border-gray-200 dark:border-dark-border-primary hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md bg-white dark:bg-dark-bg-secondary'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="flex-1 px-2 py-1 text-lg font-semibold border border-teal-500 dark:border-teal-600 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary"
                autoFocus
              />
              <button
                onClick={handleRenameSubmit}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setIsRenaming(false);
                  setNewName(metadata.saveName);
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
              >
                ✗
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">{metadata.saveName}</h3>
              <button
                onClick={() => setIsRenaming(true)}
                className="text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 text-sm"
                title="Rename save"
              >
                ✎
              </button>
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">Slot {slotId}</div>
        </div>
        {isActive && (
          <div className="bg-teal-500 dark:bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded">
            ACTIVE
          </div>
        )}
      </div>

      {/* Save Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-dark-text-secondary">Team:</span>
          <span className="font-semibold text-gray-900 dark:text-dark-text-primary">{metadata.teamName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-dark-text-secondary">Season:</span>
          <span className="font-semibold text-gray-900 dark:text-dark-text-primary">{metadata.season}/{metadata.season + 1}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-dark-text-secondary">Week:</span>
          <span className="font-semibold text-gray-900 dark:text-dark-text-primary">{metadata.week}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-dark-text-secondary">Position:</span>
          <span className={`font-semibold ${metadata.position <= 4 ? 'text-green-600 dark:text-green-400' : metadata.position >= 18 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-dark-text-primary'}`}>
            {metadata.position}
            {getPositionSuffix(metadata.position)}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="text-xs text-gray-500 dark:text-dark-text-tertiary space-y-1 pb-4 border-b border-gray-200 dark:border-dark-border-secondary">
        <div>Last saved: {formatDate(metadata.lastSaved)}</div>
        <div>Created: {formatDate(metadata.createdAt)}</div>
      </div>

      {/* Actions */}
      {!showDeleteConfirm ? (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => onLoad(slotId)}
            disabled={isActive}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-teal-500 dark:bg-teal-600 text-white hover:bg-teal-600 dark:hover:bg-teal-700'
            }`}
          >
            {isActive ? 'Loaded' : 'Load'}
          </button>
          <button
            onClick={() => onExport(slotId)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="col-span-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-400 mb-3">Are you sure you want to delete this save?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-primary hover:bg-gray-300 dark:hover:bg-dark-bg-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
