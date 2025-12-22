'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Player } from '@playground/football-director-engine';

export interface YouthAcademyModalProps {
  prospects: Player[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedPlayers: Player[]) => void;
}

export function YouthAcademyModal({
  prospects,
  isOpen,
  onClose,
  onConfirm,
}: YouthAcademyModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const togglePlayer = (playerId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      } else if (prev.length < 3) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    const selectedPlayers = prospects.filter((p) => selectedIds.includes(p.id));
    onConfirm(selectedPlayers);
    setSelectedIds([]);
    onClose();
  };

  const handleSkip = () => {
    onConfirm([]);
    setSelectedIds([]);
    onClose();
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEF':
        return 'bg-blue-100 text-blue-800';
      case 'MID':
        return 'bg-green-100 text-green-800';
      case 'FWD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillColor = (skill: number) => {
    if (skill >= 6) return 'text-green-600 font-bold';
    if (skill >= 5) return 'text-blue-600 font-semibold';
    return 'text-gray-600';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title="Youth Academy Graduates"
      footer={
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-900 font-medium py-3 px-6 rounded-lg"
          >
            Skip All
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className={`flex-1 font-medium py-3 px-6 rounded-lg ${
              selectedIds.length > 0
                ? 'bg-teal-500 hover:bg-teal-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Promote {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      }
    >
      <div className="mb-4">
        <p className="text-slate-600">
          Six young prospects have graduated from your youth academy. Select up to 3 players to
          promote to the first team squad.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Selected: {selectedIds.length}/3
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {prospects.map((player) => {
          const isSelected = selectedIds.includes(player.id);
          const canSelect = selectedIds.length < 3 || isSelected;

          return (
            <div
              key={player.id}
              onClick={() => canSelect && togglePlayer(player.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-teal-500 bg-teal-50'
                  : canSelect
                  ? 'border-gray-200 hover:border-teal-300 bg-white'
                  : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{player.name}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPositionColor(
                        player.position
                      )}`}
                    >
                      {player.position}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Age:</span>{' '}
                      <strong>{player.age}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Skill:</span>{' '}
                      <strong className={getSkillColor(player.skill)}>{player.skill}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Wages:</span>{' '}
                      <strong>£{player.wages.toLocaleString()}/wk</strong>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-teal-500 border-teal-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
