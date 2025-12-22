'use client';

import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';
import { TacticsManager as TacticsEngine } from '@playground/football-director-engine';
import { useState } from 'react';

export default function TacticsPage() {
  const { gameState, loading, error, actions } = useGameState();
  const [selectedFormation, setSelectedFormation] = useState(gameState?.playerTeam.tactics?.formation || '4-4-2');
  const [selectedMentality, setSelectedMentality] = useState(gameState?.playerTeam.tactics?.mentality || 'balanced');
  const [saved, setSaved] = useState(false);

  const tacticsEngine = new TacticsEngine();
  const formations = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2'];
  const mentalities = ['defensive', 'balanced', 'attacking'];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-900 dark:text-dark-text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-900 dark:text-dark-text-primary text-xl">No game state found</div>
      </div>
    );
  }

  const handleSave = () => {
    actions.setTeamTactics(selectedFormation as any, selectedMentality as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formationDescription = tacticsEngine.getFormationDescription(selectedFormation as any);
  const mentalityDescription = tacticsEngine.getMentalityDescription(selectedMentality as any);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-teal-500 dark:bg-dark-teal-600 text-cream-100 dark:text-dark-text-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">⚙️ Tactics Manager</h1>
              <p className="text-teal-100 dark:text-dark-text-secondary mt-1 md:mt-2 text-sm md:text-base">
                Set your team's formation and mentality
              </p>
            </div>
            <Link
              href="/"
              className="bg-white dark:bg-dark-bg-secondary text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-dark-bg-tertiary font-medium px-3 md:px-6 py-2 md:py-3 rounded-lg shadow-sm transition-normal text-sm md:text-base"
            >
              <span className="hidden md:inline">← Back to Dashboard</span>
              <span className="md:hidden">← Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Save Success Message */}
        {saved && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-900 dark:text-green-400 px-6 py-4 rounded-lg animate-fade-in">
            ✓ Tactics saved successfully!
          </div>
        )}

        {/* Formation Selection */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-4 md:p-6 border border-gray-200 dark:border-dark-border-primary">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">Formation</h3>
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
                  {tacticsEngine.getFormationDescription(formation as any)}
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
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-4 md:p-6 border border-gray-200 dark:border-dark-border-primary">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">Mentality</h3>
          <div className="grid grid-cols-3 gap-3">
            {mentalities.map((mentality) => {
              const icons = {
                defensive: '🛡️',
                balanced: '⚖️',
                attacking: '⚔️',
              };

              return (
                <button
                  key={mentality}
                  onClick={() => setSelectedMentality(mentality)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMentality === mentality
                      ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-md'
                      : 'border-gray-200 dark:border-dark-border-primary hover:border-gray-300 dark:hover:border-dark-border-secondary bg-white dark:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="text-3xl mb-1">{icons[mentality as keyof typeof icons]}</div>
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

        {/* Tactical Preview */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-4 md:p-6 border border-gray-200 dark:border-dark-border-primary">
          <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/10 p-4 rounded-lg border border-green-300 dark:border-green-700">
            <h4 className="font-semibold text-green-900 dark:text-green-400 mb-3">⚽ Your Tactics</h4>
            <div className="text-sm text-green-800 dark:text-green-400 space-y-2">
              <div>
                <strong>Formation:</strong> {selectedFormation}
              </div>
              <div>
                <strong>Mentality:</strong> {selectedMentality}
              </div>
              <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700 text-xs">
                These tactics will affect your team's performance in matches. Different formations
                counter each other, and mentality affects your attacking and defensive balance.
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-4 md:p-6 border border-gray-200 dark:border-dark-border-primary">
          <button
            onClick={handleSave}
            className="w-full px-6 py-4 bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-lg transition-normal shadow-md text-lg"
          >
            Save Tactics
          </button>
        </div>
      </main>
    </div>
  );
}
