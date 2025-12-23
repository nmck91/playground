'use client';

import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';
import { ClubPhilosophy, StaffManager } from '@playground/football-director-engine';
import { useState, useEffect } from 'react';

export default function BoardroomPage() {
  const { gameState, loading, error, actions } = useGameState();
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<ClubPhilosophy>(
    gameState?.playerTeam.philosophy || 'balanced'
  );
  const [saved, setSaved] = useState(false);

  const staffManager = new StaffManager();

  useEffect(() => {
    if (gameState?.playerTeam.philosophy) {
      setSelectedPhilosophy(gameState.playerTeam.philosophy);
    }
  }, [gameState]);

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

  const manager = gameState.playerTeam.staff.find(s => s.role === 'manager');
  const compatibility = manager?.style
    ? staffManager.calculateStyleCompatibility(manager.style, selectedPhilosophy)
    : 50;

  const handleSave = () => {
    actions.setClubPhilosophy(selectedPhilosophy);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const philosophies: Array<{
    value: ClubPhilosophy;
    label: string;
    icon: string;
    description: string;
    tactics: string;
  }> = [
    {
      value: 'attacking',
      label: 'Attacking',
      icon: '⚡',
      description: 'High-risk, high-reward football. Score more than the opposition.',
      tactics: 'Offensive formations (4-3-3, 3-4-3), high press, lots of chances',
    },
    {
      value: 'possession',
      label: 'Possession',
      icon: '🎯',
      description: 'Control the ball, control the game. Patient buildup play.',
      tactics: 'Ball-control formations (4-5-1, 3-5-2), short passing, high possession',
    },
    {
      value: 'defensive',
      label: 'Defensive',
      icon: '🛡️',
      description: 'Solid at the back, hard to break down. Counter when possible.',
      tactics: 'Defensive formations (5-3-2, 4-4-2 defensive), deep block, counter-attacks',
    },
    {
      value: 'balanced',
      label: 'Balanced',
      icon: '⚖️',
      description: 'Well-rounded approach. Adapt to the situation and opposition.',
      tactics: 'Flexible formations (4-4-2, 4-3-3), adapt to match situation',
    },
    {
      value: 'direct',
      label: 'Direct',
      icon: '➡️',
      description: 'Get the ball forward quickly. Physical, high-tempo play.',
      tactics: 'Direct formations, long balls, target man, fast transitions',
    },
    {
      value: 'counter-attack',
      label: 'Counter-Attack',
      icon: '🏃',
      description: 'Sit deep, absorb pressure, hit on the break with pace.',
      tactics: 'Deep defensive line, fast wingers/forwards, quick transitions',
    },
  ];

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-teal-600 dark:text-teal-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCompatibilityText = (score: number) => {
    if (score >= 90) return 'Perfect Match!';
    if (score >= 70) return 'Good Fit';
    if (score >= 50) return 'Acceptable';
    return 'Poor Match';
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">🏛️ Boardroom</h1>
              <p className="text-purple-100 dark:text-purple-200 mt-2">
                Set objectives and define your club philosophy
              </p>
            </div>
            <Link
              href="/"
              className="bg-white dark:bg-dark-bg-secondary text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-dark-bg-tertiary px-6 py-3 rounded-lg font-semibold transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-6 py-4 rounded-lg mb-6">
            Club philosophy updated successfully!
          </div>
        )}

        {/* Board Objectives */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
            Board Objectives & Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Season Objective</div>
              <div className="text-base font-medium text-slate-900 dark:text-dark-text-primary mb-2">
                {gameState.boardStatus.currentObjective?.description}
              </div>
              <div className={`text-sm font-semibold ${
                gameState.boardStatus.currentObjective?.status === 'on-track' ? 'text-green-600 dark:text-green-400' :
                gameState.boardStatus.currentObjective?.status === 'at-risk' ? 'text-orange-600 dark:text-orange-400' :
                gameState.boardStatus.currentObjective?.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                gameState.boardStatus.currentObjective?.status === 'achieved' ? 'text-blue-600 dark:text-blue-400' :
                'text-slate-600 dark:text-slate-400'
              }`}>
                Status: {gameState.boardStatus.currentObjective?.status.toUpperCase().replace('-', ' ')}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Board Satisfaction</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      gameState.boardStatus.satisfaction >= 60
                        ? 'bg-green-500'
                        : gameState.boardStatus.satisfaction >= 35
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${gameState.boardStatus.satisfaction}%` }}
                  />
                </div>
                <div className={`text-lg font-bold ${
                  gameState.boardStatus.satisfaction >= 60
                    ? 'text-green-600 dark:text-green-400'
                    : gameState.boardStatus.satisfaction >= 35
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {gameState.boardStatus.satisfaction}%
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Job Security</div>
              <div className={`text-xl font-bold ${
                gameState.boardStatus.jobSecurity === 'safe' ? 'text-green-600 dark:text-green-400' :
                gameState.boardStatus.jobSecurity === 'under-pressure' ? 'text-orange-600 dark:text-orange-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {gameState.boardStatus.jobSecurity === 'safe' && '✅ SAFE'}
                {gameState.boardStatus.jobSecurity === 'under-pressure' && '⚠️ UNDER PRESSURE'}
                {gameState.boardStatus.jobSecurity === 'critical' && '🚨 CRITICAL'}
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
                How Club Philosophy Works
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• You set the <strong>club philosophy</strong> as the director</li>
                <li>• Your <strong>manager</strong> implements tactics based on their style</li>
                <li>• Hire managers whose style matches your philosophy for best results</li>
                <li>• Manager happiness is affected by philosophy compatibility</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Manager Info */}
        {manager && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
              Current Manager
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary">
                  👔 {manager.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary mt-1">
                  Style: <span className="font-semibold capitalize">{manager.style || 'Unknown'}</span>
                </p>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
                  Happiness: <span className="font-semibold">{manager.happiness || 80}/100</span>
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getCompatibilityColor(compatibility)}`}>
                  {compatibility}%
                </div>
                <div className={`text-sm font-semibold ${getCompatibilityColor(compatibility)}`}>
                  {getCompatibilityText(compatibility)}
                </div>
              </div>
            </div>
          </div>
        )}

        {!manager && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-400 px-6 py-4 rounded-lg mb-8">
            ⚠️ No manager hired. Visit the Staff page to hire a manager.
          </div>
        )}

        {/* Philosophy Selection */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
            Select Club Philosophy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {philosophies.map((phil) => {
              const isSelected = selectedPhilosophy === phil.value;
              const philCompatibility = manager?.style
                ? staffManager.calculateStyleCompatibility(manager.style, phil.value)
                : 50;

              return (
                <button
                  key={phil.value}
                  onClick={() => setSelectedPhilosophy(phil.value)}
                  className={`text-left p-5 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-dark-border-primary hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{phil.icon}</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text-primary">
                        {phil.label}
                      </h3>
                    </div>
                    {isSelected && (
                      <span className="text-purple-600 dark:text-purple-400 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-dark-text-secondary mb-3">
                    {phil.description}
                  </p>
                  <div className="text-xs text-slate-600 dark:text-dark-text-tertiary mb-3 pb-3 border-b border-gray-200 dark:border-dark-border-secondary">
                    {phil.tactics}
                  </div>
                  {manager?.style && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-dark-text-tertiary">Manager Match:</span>
                      <span className={`font-bold ${getCompatibilityColor(philCompatibility)}`}>
                        {philCompatibility}%
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="bg-purple-500 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold py-4 px-12 rounded-lg text-lg shadow-lg transition-all active:scale-98"
          >
            💾 Save Philosophy
          </button>
        </div>
      </main>
    </div>
  );
}
