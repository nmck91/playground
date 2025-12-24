'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Player } from '@playground/football-director-engine';
import { useGameState } from '../hooks/useGameState';
import { MatchHighlights } from '../components/game/MatchHighlights';
import { DevelopmentReport } from '../components/game/DevelopmentReport';
import { SeasonEvaluation } from '../components/game/SeasonEvaluation';
import { TopPerformersWidget } from '../components/game/TopPerformersWidget';
import { PlayerStatsModal } from '../components/game/PlayerStatsModal';
import { RecordsModal } from '../components/game/RecordsModal';
import { TrophyCabinet } from '../components/game/TrophyCabinet';
import { AchievementToast } from '../components/game/AchievementToast';
import { NewsFeed } from '../components/game/NewsFeed';
import { NewsTickerWidget } from '../components/game/NewsTickerWidget';
import { SaveSlotManager } from '../components/saves/SaveSlotManager';
import { YouthAcademyModal } from '../components/game/YouthAcademyModal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { CollapsibleSection } from '../components/ui/CollapsibleSection';
import Link from 'next/link';

export default function Dashboard() {
  const { gameState, loading, error, lastSimulationResults, developmentReports, seasonTopPerformers, seasonEvaluation, pendingAchievements, youthProspects, actions } = useGameState();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  const [showDevelopment, setShowDevelopment] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [showTrophyCabinet, setShowTrophyCabinet] = useState(false);
  const [showNewsFeed, setShowNewsFeed] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Show highlights after simulation
  useEffect(() => {
    if (lastSimulationResults && lastSimulationResults.length > 0) {
      setShowHighlights(true);
    }
  }, [lastSimulationResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu && !(event.target as Element).closest('.relative')) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  // Show development report when available
  useEffect(() => {
    if (developmentReports && developmentReports.length > 0) {
      setShowDevelopment(true);
    }
  }, [developmentReports]);

  // Show season evaluation when available
  useEffect(() => {
    if (seasonEvaluation) {
      setShowEvaluation(true);
    }
  }, [seasonEvaluation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-slate-900 text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <SaveSlotManager
        onLoadSlot={actions.loadSlot}
        onCreateNew={actions.newGame}
      />
    );
  }

  const sortedTable = gameState.leagueTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const playerPosition = sortedTable.findIndex((entry) => entry.teamId === gameState.playerTeam.id) + 1;

  // Get manager info for happiness display
  const manager = gameState.playerTeam.staff.find(s => s.role === 'manager');

  // Get condensed table (5 teams centered around player position)
  const getCondensedTable = () => {
    const totalTeams = sortedTable.length;
    let startIndex = 0;
    let endIndex = 5;

    if (playerPosition === 1) {
      // At top: show top 5
      startIndex = 0;
      endIndex = 5;
    } else if (playerPosition === 2) {
      // 2nd place: show 1 above, 3 below
      startIndex = 0;
      endIndex = 5;
    } else if (playerPosition >= totalTeams - 1) {
      // At bottom or 2nd from bottom: show bottom 5
      startIndex = Math.max(0, totalTeams - 5);
      endIndex = totalTeams;
    } else {
      // Middle: show 2 above, player, 2 below
      startIndex = Math.max(0, playerPosition - 3);
      endIndex = Math.min(totalTeams, startIndex + 5);
    }

    return sortedTable.slice(startIndex, endIndex);
  };

  const condensedTable = getCondensedTable();

  const isSeasonComplete = gameState.season.status === 'completed';

  const getJobSecurityColor = (security: string) => {
    switch (security) {
      case 'safe':
        return 'text-green-600';
      case 'under-pressure':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getObjectiveStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600';
      case 'at-risk':
        return 'text-orange-600';
      case 'failed':
        return 'text-red-600';
      case 'achieved':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerStats(true);
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              {mounted && (
                <img
                  src={theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
                    ? '/football-director-logo-text.svg'
                    : '/football-director-logo-text-white.svg'
                  }
                  alt="Football Director"
                  className="h-[40px]"
                />
              )}
              {!mounted && (
                <div className="h-[40px] w-48 bg-gray-200 dark:bg-dark-bg-tertiary animate-pulse rounded" />
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-safe">
        

        {/* Key Stats (3 cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Link
            href="/fixtures"
            className="bg-white dark:bg-dark-bg-secondary rounded-xl p-8 border border-gray-200 dark:border-dark-border-primary hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all active:scale-98"
          >
            <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">{gameState.playerTeam.name}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">
              Week {gameState.season.currentWeek}/{gameState.season.totalWeeks}
            </div>
            <div className="text-xs mt-1">
              {gameState.season.phase === 'pre-season' ? (
                <span className="text-purple-600 dark:text-purple-400 font-semibold">🏋️ Pre-Season</span>
              ) : gameState.season.phase === 'competitive' ? (
                <span className="text-green-600 dark:text-green-400 font-semibold">⚽ Match Week</span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-semibold">🏖️ Off-Season</span>
              )}
            </div>
          </Link>

          <Link
            href="/transfers"
            className="bg-white dark:bg-dark-bg-secondary rounded-xl p-8 border border-gray-200 dark:border-dark-border-primary hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all active:scale-98"
          >
            <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Budget</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-2">
              £{(gameState.finances.budget / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs">
              <span className="text-slate-500 dark:text-dark-text-secondary">Transfers: </span>
              {gameState.season.transferWindow === 'open' ? (
                <span className="text-green-600 dark:text-green-400 font-semibold">✅ Open</span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-semibold">🔒 Closed</span>
              )}
            </div>
          </Link>

          <Link
            href="/tactics"
            className="bg-white dark:bg-dark-bg-secondary rounded-xl p-8 border border-gray-200 dark:border-dark-border-primary hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all active:scale-98 col-span-2 md:col-span-1"
          >
            <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Board Status</div>
            <div className={`text-2xl font-bold mb-2 ${
              gameState.boardStatus.satisfaction >= 60
                ? 'text-green-600 dark:text-green-400'
                : gameState.boardStatus.satisfaction >= 35
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {gameState.boardStatus.satisfaction}%
            </div>
            <div className="text-xs">
              <span className={getJobSecurityColor(gameState.boardStatus.jobSecurity) + ' font-semibold'}>
                {gameState.boardStatus.jobSecurity === 'safe' && '✅ Safe'}
                {gameState.boardStatus.jobSecurity === 'under-pressure' && '⚠️ Under Pressure'}
                {gameState.boardStatus.jobSecurity === 'critical' && '🚨 Critical'}
              </span>
            </div>
          </Link>
        </div>

        {/* Manager Happiness & Squad Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Manager Happiness */}
          {manager && manager.happiness !== undefined && (
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-200 dark:border-dark-border-primary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text-primary">
                  Manager Happiness
                </h3>
                <Link
                  href="/staff"
                  className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  View Staff →
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-dark-text-primary">
                    👔 {manager.name}
                  </div>
                  {manager.style && (
                    <div className="text-xs text-slate-600 dark:text-dark-text-secondary capitalize mt-1">
                      Style: {manager.style}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${
                    manager.happiness >= 80
                      ? 'text-green-600 dark:text-green-400'
                      : manager.happiness >= 60
                      ? 'text-teal-600 dark:text-teal-400'
                      : manager.happiness >= 40
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {manager.happiness}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">
                    {manager.happiness >= 80 && '😊 Very Happy'}
                    {manager.happiness >= 60 && manager.happiness < 80 && '🙂 Content'}
                    {manager.happiness >= 40 && manager.happiness < 60 && '😐 Neutral'}
                    {manager.happiness >= 20 && manager.happiness < 40 && '😟 Unhappy'}
                    {manager.happiness < 20 && '😡 Very Unhappy'}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex-1 bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      manager.happiness >= 80
                        ? 'bg-green-500'
                        : manager.happiness >= 60
                        ? 'bg-teal-500'
                        : manager.happiness >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${manager.happiness}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Squad Overview */}
          <Link
            href="/squad"
            className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-200 dark:border-dark-border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text-primary">
                Squad Overview
              </h3>
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                View Squad →
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500 dark:text-dark-text-secondary">
                  Overall Rating
                </div>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {Math.round(gameState.playerTeam.players.reduce((sum, p) => sum + p.skill, 0) / gameState.playerTeam.players.length)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500 dark:text-dark-text-secondary">
                  Squad Size
                </div>
                <div className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary">
                  👥 {gameState.playerTeam.players.length}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500 dark:text-dark-text-secondary">
                  Total Wages
                </div>
                <div className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary">
                  £{(gameState.playerTeam.players.reduce((sum, p) => sum + p.wages, 0) / 1000).toFixed(0)}k/wk
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Simulate Button (Full-Width, Bold) */}
        <button
          onClick={actions.simulateNextWeek}
          disabled={isSeasonComplete}
          className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-600 dark:to-emerald-700 text-white text-xl font-bold rounded-xl shadow-lg active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isSeasonComplete
            ? '✅ Season Complete'
            : gameState.season.phase === 'pre-season' && [4, 5, 6].includes(gameState.season.currentWeek)
            ? '⚽ Play Friendly'
            : gameState.season.phase === 'pre-season'
            ? '▶️ Continue Pre-Season'
            : gameState.season.phase === 'off-season'
            ? '▶️ Continue Off-Season'
            : '⚽ Simulate Next Week'}
        </button>

        {/* League Position & Table (Collapsible) */}
        <div className="mb-6">
          <CollapsibleSection
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-baseline gap-3">
                  <div className="text-sm font-medium text-slate-500 dark:text-dark-text-secondary">
                    League Position:
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">
                    {playerPosition}
                    {playerPosition === 1 && <span className="ml-2 text-2xl">🏆</span>}
                  </div>
                  <div className="text-base text-slate-600 dark:text-dark-text-secondary">
                    / {sortedTable.length}
                  </div>
                </div>
                <Link
                  href="/table"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-all active:scale-95"
                >
                  Full Table →
                </Link>
              </div>
            }
            defaultOpen={true}
          >
            <div className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-dark-border-primary">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Pos</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">P</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">W</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">D</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">L</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">GF</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">GA</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">GD</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {condensedTable.map((entry) => {
                      const position = sortedTable.findIndex(t => t.teamId === entry.teamId) + 1;
                      return (
                        <tr
                          key={entry.teamId}
                          className={`border-b border-gray-100 dark:border-dark-border-secondary ${
                            entry.teamId === gameState.playerTeam.id
                              ? 'bg-teal-50 dark:bg-dark-teal-50 font-semibold'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{position}</td>
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-dark-text-primary">{entry.teamName}</td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{entry.played}</td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{entry.won}</td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{entry.drawn}</td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{entry.lost}</td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{entry.goalsFor}</td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{entry.goalsAgainst}</td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                            {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-teal-600 dark:text-teal-400">{entry.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Top Performers Widget */}
        {seasonTopPerformers && (
          <div className="mb-8">
            <TopPerformersWidget
              topPerformers={seasonTopPerformers}
              onPlayerClick={handlePlayerClick}
            />
          </div>
        )}

        {/* News Ticker Widget */}
        <NewsTickerWidget
          news={gameState.newsFeed}
          onNewsClick={() => setShowNewsFeed(true)}
        />

        {/* Settings Section */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wide mb-3 px-1">
            Settings
          </h2>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-between w-full h-14 px-5 bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary hover:shadow-md active:scale-98 transition-all text-red-600 dark:text-red-400"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🗑️</span>
              <span className="text-base font-medium">Delete Save</span>
            </div>
          </button>
        </div>
      </main>

      {/* Match Highlights Modal */}
      {showHighlights && gameState && lastSimulationResults.length > 0 && (
        <MatchHighlights
          results={lastSimulationResults}
          playerTeamName={gameState.playerTeam.name}
          onClose={() => setShowHighlights(false)}
        />
      )}

      {/* Development Report Modal */}
      {showDevelopment && developmentReports.length > 0 && (
        <DevelopmentReport
          reports={developmentReports}
          onClose={() => setShowDevelopment(false)}
        />
      )}

      {/* Season Evaluation Modal */}
      {showEvaluation && seasonEvaluation && (
        <SeasonEvaluation
          evaluation={seasonEvaluation}
          onContinue={() => {
            actions.continueToNextSeason();
            setShowEvaluation(false);
          }}
          onGameOver={() => {
            actions.deleteSave();
            window.location.reload();
          }}
        />
      )}

      {/* Player Stats Modal */}
      <PlayerStatsModal
        player={selectedPlayer}
        isOpen={showPlayerStats}
        onClose={() => {
          setShowPlayerStats(false);
          setSelectedPlayer(null);
        }}
      />

      {/* Records Modal */}
      {gameState && (
        <RecordsModal
          clubRecords={gameState.clubRecords}
          seasonRecords={gameState.seasonRecords}
          currentSeason={gameState.season.year}
          isOpen={showRecords}
          onClose={() => setShowRecords(false)}
        />
      )}

      {/* Trophy Cabinet Modal */}
      {gameState && (
        <TrophyCabinet
          achievements={gameState.achievements}
          seasonAwards={gameState.seasonAwards}
          isOpen={showTrophyCabinet}
          onClose={() => setShowTrophyCabinet(false)}
        />
      )}

      {/* News Feed Modal */}
      {gameState && (
        <NewsFeed
          news={gameState.newsFeed}
          isOpen={showNewsFeed}
          onClose={() => setShowNewsFeed(false)}
          onMarkAllRead={actions.markAllNewsRead}
        />
      )}

      {/* Achievement Toast */}
      <AchievementToast
        achievements={pendingAchievements}
        onDismiss={actions.dismissAchievement}
      />

      {/* Youth Academy Modal */}
      <YouthAcademyModal
        prospects={youthProspects}
        isOpen={youthProspects.length > 0}
        onClose={() => actions.selectYouthPlayers([])}
        onConfirm={actions.selectYouthPlayers}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
              Delete Save?
            </h3>
            <p className="text-slate-600 dark:text-dark-text-secondary mb-6">
              Are you sure you want to delete your save? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-slate-900 dark:text-dark-text-primary font-semibold rounded-lg transition-all active:scale-98"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  actions.deleteSave();
                  setShowDeleteConfirm(false);
                  window.location.reload();
                }}
                className="flex-1 px-4 py-3 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold rounded-lg transition-all active:scale-98"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
