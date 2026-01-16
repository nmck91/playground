/**
 * Team Selection Modal Component
 * Allows player to choose their team when starting a new game
 */

'use client';

import { useState, useEffect } from 'react';
import type { Team } from '@playground/football-director-engine';
import { globalRegistry, ModuleKeys, initializeEngine } from '@playground/football-director-engine';

export interface TeamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (teamIndex: number, saveName?: string) => void;
  saveName?: string;
}

export function TeamSelectionModal({ isOpen, onClose, onSelectTeam, saveName }: TeamSelectionModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      generateTeams();
    }
  }, [isOpen]);

  const generateTeams = () => {
    setLoading(true);
    try {
      // Ensure engine is initialized on client side
      initializeEngine();

      const generator = globalRegistry.get<any>(ModuleKeys.TEAM_GENERATOR);
      const generatedTeams = generator.generateLeague(Date.now());
      setTeams(generatedTeams);
      setLoading(false);
    } catch (error) {
      console.error('Failed to generate teams:', error);
      setLoading(false);
    }
  };

  const calculateSquadRating = (team: Team): number => {
    if (!team.players || team.players.length === 0) return 0;
    const avgRating = team.players.reduce((sum, player) => sum + player.skill, 0) / team.players.length;
    return Math.round(avgRating);
  };

  const getDifficultyLevel = (rating: number): { label: string; color: string } => {
    if (rating >= 15) return { label: 'Easy', color: 'text-green-600 dark:text-green-400' };
    if (rating >= 11) return { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
    if (rating >= 8) return { label: 'Hard', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Very Hard', color: 'text-red-600 dark:text-red-400' };
  };

  const handleConfirm = () => {
    if (selectedTeamIndex !== null) {
      onSelectTeam(selectedTeamIndex, saveName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 p-6">
          <h2 className="text-2xl font-bold text-white">Choose Your Team</h2>
          <p className="text-teal-100 mt-1">Select a team to manage in your new career</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-dark-text-secondary">Generating teams...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {teams.map((team, index) => {
                const squadRating = calculateSquadRating(team);
                const difficulty = getDifficultyLevel(squadRating);
                const isSelected = selectedTeamIndex === index;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedTeamIndex(index)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-md'
                          : 'border-gray-200 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary hover:border-teal-300 dark:hover:border-teal-600 hover:shadow'
                      }
                    `}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-6 h-6 text-teal-500 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Team name */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary mb-3 pr-8">
                      {team.name}
                    </h3>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-dark-text-secondary">Squad Rating</span>
                        <span className="font-semibold text-slate-900 dark:text-dark-text-primary">{squadRating}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-dark-text-secondary">Budget</span>
                        <span className="font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{(team.budget / 1000000).toFixed(1)}M
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-dark-text-secondary">Squad Size</span>
                        <span className="font-semibold text-slate-900 dark:text-dark-text-primary">
                          {team.players.length}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-dark-border-primary">
                        <span className="text-sm text-slate-600 dark:text-dark-text-secondary">Difficulty</span>
                        <span className={`font-bold ${difficulty.color}`}>{difficulty.label}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Help text */}
          {!loading && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Higher squad ratings make the game easier. Lower ratings provide a greater challenge!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-dark-border-primary p-6 bg-gray-50 dark:bg-dark-bg-tertiary flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-slate-900 dark:text-dark-text-primary rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-4">
            {selectedTeamIndex !== null && (
              <div className="text-sm text-slate-600 dark:text-dark-text-secondary">
                Selected: <span className="font-semibold text-slate-900 dark:text-dark-text-primary">{teams[selectedTeamIndex]?.name}</span>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={selectedTeamIndex === null}
              className={`
                px-6 py-2.5 rounded-lg font-medium transition-colors
                ${
                  selectedTeamIndex !== null
                    ? 'bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Start Career
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
