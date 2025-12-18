'use client';

import { FormationType, Mentality, TacticsManager as TacticsEngine } from '@playground/football-director-engine';
import { useState } from 'react';

interface TacticsManagerProps {
  currentFormation: FormationType;
  currentMentality: Mentality;
  onSave: (formation: FormationType, mentality: Mentality) => void;
  onClose: () => void;
  isOpen: boolean;
}

const formations: FormationType[] = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2'];
const mentalities: Mentality[] = ['defensive', 'balanced', 'attacking'];

export function TacticsManager({
  currentFormation,
  currentMentality,
  onSave,
  onClose,
  isOpen,
}: TacticsManagerProps) {
  const [selectedFormation, setSelectedFormation] = useState<FormationType>(currentFormation);
  const [selectedMentality, setSelectedMentality] = useState<Mentality>(currentMentality);

  const tacticsEngine = new TacticsEngine();

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedFormation, selectedMentality);
    onClose();
  };

  const formationDescription = tacticsEngine.getFormationDescription(selectedFormation);
  const mentalityDescription = tacticsEngine.getMentalityDescription(selectedMentality);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold text-white">⚙️ Tactics Manager</h2>
          <p className="text-teal-100 mt-1">Set your team's formation and mentality</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Formation Selection */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Formation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formations.map((formation) => (
                <button
                  key={formation}
                  onClick={() => setSelectedFormation(formation)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedFormation === formation
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-teal-300 bg-white'
                  }`}
                >
                  <div className="text-2xl font-bold text-slate-900">{formation}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {tacticsEngine.getFormationDescription(formation)}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Selected:</strong> {formationDescription}
              </p>
            </div>
          </div>

          {/* Mentality Selection */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Mentality</h3>
            <div className="grid grid-cols-3 gap-3">
              {mentalities.map((mentality) => {
                const icons = {
                  defensive: '🛡️',
                  balanced: '⚖️',
                  attacking: '⚔️',
                };
                const colors = {
                  defensive: 'blue',
                  balanced: 'gray',
                  attacking: 'red',
                };
                const color = colors[mentality];

                return (
                  <button
                    key={mentality}
                    onClick={() => setSelectedMentality(mentality)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMentality === mentality
                        ? `border-${color}-500 bg-${color}-50 shadow-md`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    style={{
                      borderColor: selectedMentality === mentality
                        ? mentality === 'defensive' ? '#3b82f6'
                        : mentality === 'attacking' ? '#ef4444'
                        : '#6b7280'
                        : undefined,
                      backgroundColor: selectedMentality === mentality
                        ? mentality === 'defensive' ? '#eff6ff'
                        : mentality === 'attacking' ? '#fef2f2'
                        : '#f3f4f6'
                        : undefined,
                    }}
                  >
                    <div className="text-3xl mb-1">{icons[mentality]}</div>
                    <div className="text-sm font-semibold text-slate-900 capitalize">
                      {mentality}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900">
                <strong>Selected:</strong> {mentalityDescription}
              </p>
            </div>
          </div>

          {/* Tactical Preview */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg border border-green-300">
            <h4 className="font-semibold text-green-900 mb-2">⚽ Your Tactics</h4>
            <div className="text-sm text-green-800 space-y-1">
              <div>
                <strong>Formation:</strong> {selectedFormation}
              </div>
              <div>
                <strong>Mentality:</strong> {selectedMentality}
              </div>
              <div className="mt-2 pt-2 border-t border-green-300 text-xs">
                These tactics will affect your team's performance in matches. Different formations
                counter each other, and mentality affects your attacking and defensive balance.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-slate-900 font-semibold rounded-lg transition-normal"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-normal shadow-md"
          >
            Save Tactics
          </button>
        </div>
      </div>
    </div>
  );
}
