'use client';

import {
  FormationType,
  Mentality,
  TacticsManager as TacticsEngine,
  PlayerRoles,
  TeamInstructions,
  SetPieceAssignments,
  Tactics,
  Player,
  DefenderRole,
  MidfielderRole,
  ForwardRole,
} from '@playground/football-director-engine';
import { useState } from 'react';

interface TacticsManagerProps {
  currentFormation: FormationType;
  currentMentality: Mentality;
  currentTactics?: Tactics;
  players?: Player[];
  onSave: (tactics: Tactics) => void;
  onClose: () => void;
  isOpen: boolean;
}

const formations: FormationType[] = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2'];
const mentalities: Mentality[] = ['defensive', 'balanced', 'attacking'];

export function TacticsManager({
  currentFormation,
  currentMentality,
  currentTactics,
  players = [],
  onSave,
  onClose,
  isOpen,
}: TacticsManagerProps) {
  const tacticsEngine = new TacticsEngine();

  const [selectedFormation, setSelectedFormation] = useState<FormationType>(currentFormation);
  const [selectedMentality, setSelectedMentality] = useState<Mentality>(currentMentality);
  const [roles, setRoles] = useState<PlayerRoles>(
    currentTactics?.roles || tacticsEngine.getDefaultRoles()
  );
  const [instructions, setInstructions] = useState<TeamInstructions>(
    currentTactics?.instructions || tacticsEngine.getDefaultInstructions()
  );
  const [setPieces, setSetPieces] = useState<SetPieceAssignments>(
    currentTactics?.setPieces || {}
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const tactics: Tactics = {
      formation: selectedFormation,
      mentality: selectedMentality,
      roles,
      instructions,
      setPieces,
    };
    onSave(tactics);
    onClose();
  };

  const formationDescription = tacticsEngine.getFormationDescription(selectedFormation);
  const mentalityDescription = tacticsEngine.getMentalityDescription(selectedMentality);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-dark-border-primary">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-dark-teal-600 dark:to-dark-teal-600 p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold text-white">⚙️ Tactics Manager</h2>
          <p className="text-teal-100 dark:text-dark-text-secondary mt-1">Set your team's formation and mentality</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Formation Selection */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-3">Formation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formations.map((formation) => (
                <button
                  key={formation}
                  onClick={() => setSelectedFormation(formation)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedFormation === formation
                      ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-md'
                      : 'border-gray-200 dark:border-dark-border-primary hover:border-teal-300 dark:hover:border-teal-600 bg-white dark:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">{formation}</div>
                  <div className="text-xs text-slate-600 dark:text-dark-text-secondary mt-1">
                    {tacticsEngine.getFormationDescription(formation)}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-900 dark:text-blue-400">
                <strong>Selected:</strong> {formationDescription}
              </p>
            </div>
          </div>

          {/* Mentality Selection */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-3">Mentality</h3>
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
                        : 'border-gray-200 dark:border-dark-border-primary hover:border-gray-300 dark:hover:border-dark-border-secondary bg-white dark:bg-dark-bg-tertiary'
                    }`}
                    style={{
                      borderColor: selectedMentality === mentality
                        ? mentality === 'defensive' ? '#3b82f6'
                        : mentality === 'attacking' ? '#ef4444'
                        : '#6b7280'
                        : undefined,
                      backgroundColor: selectedMentality === mentality
                        ? mentality === 'defensive' ? (document.documentElement.classList.contains('dark') ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff')
                        : mentality === 'attacking' ? (document.documentElement.classList.contains('dark') ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2')
                        : (document.documentElement.classList.contains('dark') ? 'rgba(107, 114, 128, 0.2)' : '#f3f4f6')
                        : undefined,
                    }}
                  >
                    <div className="text-3xl mb-1">{icons[mentality]}</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-dark-text-primary capitalize">
                      {mentality}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-purple-900 dark:text-purple-400">
                <strong>Selected:</strong> {mentalityDescription}
              </p>
            </div>
          </div>

          {/* Advanced Tactics Toggle */}
          <div className="border-t border-gray-200 dark:border-dark-border-primary pt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="font-semibold text-purple-900 dark:text-purple-400">Advanced Tactics</span>
              </div>
              <span className="text-purple-600 dark:text-purple-400 text-xl">
                {showAdvanced ? '▼' : '▶'}
              </span>
            </button>
          </div>

          {/* Advanced Tactics Sections */}
          {showAdvanced && (
            <div className="space-y-6 border border-purple-200 dark:border-purple-700 rounded-lg p-6 bg-purple-50/50 dark:bg-purple-900/10">
              {/* Player Roles */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <span>👥</span> Player Roles
                </h3>
                <div className="space-y-3">
                  {/* Defender Roles */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Defenders
                    </label>
                    <select
                      value={roles.defenders || 'full-back'}
                      onChange={(e) => setRoles({ ...roles, defenders: e.target.value as DefenderRole })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary"
                    >
                      {tacticsEngine.getDefenderRoles().map((role) => (
                        <option key={role} value={role}>
                          {role.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} - {tacticsEngine.getRoleDescription(role)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Midfielder Roles */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Midfielders
                    </label>
                    <select
                      value={roles.midfielders || 'box-to-box'}
                      onChange={(e) => setRoles({ ...roles, midfielders: e.target.value as MidfielderRole })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary"
                    >
                      {tacticsEngine.getMidfielderRoles().map((role) => (
                        <option key={role} value={role}>
                          {role.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} - {tacticsEngine.getRoleDescription(role)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Forward Roles */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Forwards
                    </label>
                    <select
                      value={roles.forwards || 'poacher'}
                      onChange={(e) => setRoles({ ...roles, forwards: e.target.value as ForwardRole })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary"
                    >
                      {tacticsEngine.getForwardRoles().map((role) => (
                        <option key={role} value={role}>
                          {role.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} - {tacticsEngine.getRoleDescription(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Team Instructions */}
              <div className="border-t border-purple-200 dark:border-purple-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <span>📋</span> Team Instructions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Tempo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Tempo
                    </label>
                    <select
                      value={instructions.tempo}
                      onChange={(e) => setInstructions({ ...instructions, tempo: e.target.value as 'slow' | 'balanced' | 'fast' })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary text-sm"
                    >
                      {['slow', 'balanced', 'fast'].map((tempo) => (
                        <option key={tempo} value={tempo}>
                          {tempo.charAt(0).toUpperCase() + tempo.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Width */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Width
                    </label>
                    <select
                      value={instructions.width}
                      onChange={(e) => setInstructions({ ...instructions, width: e.target.value as 'narrow' | 'balanced' | 'wide' })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary text-sm"
                    >
                      {['narrow', 'balanced', 'wide'].map((width) => (
                        <option key={width} value={width}>
                          {width.charAt(0).toUpperCase() + width.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pressing */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Pressing
                    </label>
                    <select
                      value={instructions.pressing}
                      onChange={(e) => setInstructions({ ...instructions, pressing: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary text-sm"
                    >
                      {['low', 'medium', 'high'].map((pressing) => (
                        <option key={pressing} value={pressing}>
                          {pressing.charAt(0).toUpperCase() + pressing.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Passing Style */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Passing
                    </label>
                    <select
                      value={instructions.passingStyle}
                      onChange={(e) => setInstructions({ ...instructions, passingStyle: e.target.value as 'short' | 'mixed' | 'long' })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary text-sm"
                    >
                      {['short', 'mixed', 'long'].map((passing) => (
                        <option key={passing} value={passing}>
                          {passing.charAt(0).toUpperCase() + passing.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Set Pieces */}
              <div className="border-t border-purple-200 dark:border-purple-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <span>⚽</span> Set Piece Takers
                </h3>
                <div className="space-y-3">
                  {/* Penalty Taker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Penalties
                    </label>
                    <select
                      value={setPieces.penaltyTaker || ''}
                      onChange={(e) => setSetPieces({ ...setPieces, penaltyTaker: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary"
                    >
                      <option value="">Best Available</option>
                      {players.sort((a, b) => b.skill - a.skill).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.position}) - Skill: {player.skill}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Free Kick Taker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Free Kicks
                    </label>
                    <select
                      value={setPieces.freeKickTaker || ''}
                      onChange={(e) => setSetPieces({ ...setPieces, freeKickTaker: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary"
                    >
                      <option value="">Best Available</option>
                      {players.sort((a, b) => b.skill - a.skill).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.position}) - Skill: {player.skill}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Corner Taker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-2">
                      Corners
                    </label>
                    <select
                      value={setPieces.cornerTaker || ''}
                      onChange={(e) => setSetPieces({ ...setPieces, cornerTaker: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text-primary"
                    >
                      <option value="">Best Available</option>
                      {players.sort((a, b) => b.skill - a.skill).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.position}) - Skill: {player.skill}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tactical Preview */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/10 p-4 rounded-lg border border-green-300 dark:border-green-700">
            <h4 className="font-semibold text-green-900 dark:text-green-400 mb-2">⚽ Your Tactics</h4>
            <div className="text-sm text-green-800 dark:text-green-400 space-y-1">
              <div>
                <strong>Formation:</strong> {selectedFormation}
              </div>
              <div>
                <strong>Mentality:</strong> {selectedMentality}
              </div>
              <div className="mt-2 pt-2 border-t border-green-300 dark:border-green-700 text-xs">
                These tactics will affect your team's performance in matches. Different formations
                counter each other, and mentality affects your attacking and defensive balance.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 dark:bg-dark-bg-tertiary rounded-b-lg border-t border-gray-200 dark:border-dark-border-primary">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-slate-900 dark:text-dark-text-primary font-semibold rounded-lg transition-normal"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-lg transition-normal shadow-md"
          >
            Save Tactics
          </button>
        </div>
      </div>
    </div>
  );
}
