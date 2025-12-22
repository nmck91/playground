'use client';

import { useState, useEffect } from 'react';
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
import { TacticsManager } from '../components/game/TacticsManager';
import { SaveSlotManager } from '../components/saves/SaveSlotManager';
import { YouthAcademyModal } from '../components/game/YouthAcademyModal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { CollapsibleSection } from '../components/ui/CollapsibleSection';
import { GradientButton } from '../components/ui/GradientButton';
import Link from 'next/link';

export default function Dashboard() {
  const { gameState, loading, error, lastSimulationResults, developmentReports, seasonTopPerformers, seasonEvaluation, pendingAchievements, youthProspects, actions } = useGameState();
  const [showHighlights, setShowHighlights] = useState(false);
  const [showDevelopment, setShowDevelopment] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [showTrophyCabinet, setShowTrophyCabinet] = useState(false);
  const [showNewsFeed, setShowNewsFeed] = useState(false);
  const [showTactics, setShowTactics] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
      <header className="bg-teal-500 dark:bg-dark-teal-600 text-cream-100 dark:text-dark-text-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">⚽ Football Director</h1>
              <p className="text-teal-100 mt-2">{gameState.playerTeam.name}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-safe">
        {/* Hero: League Position (Priority #1 on mobile) */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 dark:from-dark-teal-600 dark:to-dark-teal-600 rounded-xl p-6 text-white shadow-lg mb-4">
          <div className="text-sm font-medium text-teal-100 dark:text-dark-text-secondary mb-1">League Position</div>
          <div className="text-5xl font-bold mb-2">
            {playerPosition}
            {playerPosition === 1 && ' 🏆'}
          </div>
          <div className="text-teal-100 dark:text-dark-text-secondary">
            {gameState.playerTeam.name} • Season {gameState.season.year}
          </div>
        </div>

        {/* Secondary Stats (2 columns on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 border border-gray-200 dark:border-dark-border-primary">
            <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Week</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">
              {gameState.season.currentWeek}/{gameState.season.totalWeeks}
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
          </div>

          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 border border-gray-200 dark:border-dark-border-primary">
            <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Budget</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">
              £{(gameState.finances.budget / 1000000).toFixed(1)}M
            </div>
          </div>

          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 border border-gray-200 dark:border-dark-border-primary">
            <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Transfers</div>
            <div className="text-lg font-bold">
              {gameState.season.transferWindow === 'open' ? (
                <span className="text-green-600 dark:text-green-400">✅ Open</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">🔒 Closed</span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 border border-gray-200 dark:border-dark-border-primary">
            <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Job Security</div>
            <div className="text-base font-bold">
              {gameState.boardStatus.jobSecurity === 'safe' && <span className="text-green-600 dark:text-green-400">✅ Safe</span>}
              {gameState.boardStatus.jobSecurity === 'under-pressure' && <span className="text-orange-600 dark:text-orange-400">⚠️ Pressure</span>}
              {gameState.boardStatus.jobSecurity === 'critical' && <span className="text-red-600 dark:text-red-400">🚨 Critical</span>}
            </div>
          </div>
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

        {/* Quick Actions (2 columns on mobile, 3 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <GradientButton
            icon="👥"
            label="Squad"
            href="/squad"
            gradient="from-gradient-squad-from to-gradient-squad-to"
          />
          <GradientButton
            icon="⚽"
            label="Matches"
            href="/fixtures"
            gradient="from-gradient-matches-from to-gradient-matches-to"
          />
          <GradientButton
            icon="💰"
            label="Transfers"
            href="/transfers"
            gradient="from-gradient-transfers-from to-gradient-transfers-to"
          />
          <GradientButton
            icon="📋"
            label="Tactics"
            href="/tactics"
            gradient="from-gradient-tactics-from to-gradient-tactics-to"
            onClick={() => setShowTactics(true)}
          />
          <GradientButton
            icon="📊"
            label="League Table"
            href="/table"
            gradient="from-teal-500 to-teal-600"
          />
          <GradientButton
            icon="📈"
            label="Statistics"
            href="/stats"
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Board Status (Collapsible on mobile) */}
        <div className="mb-6">
          <CollapsibleSection title="Board Status" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Season Objective</div>
                <div className="text-base font-medium text-slate-900 dark:text-dark-text-primary mb-2">
                  {gameState.boardStatus.currentObjective?.description}
                </div>
                <div className={`text-sm font-semibold ${getObjectiveStatusColor(gameState.boardStatus.currentObjective?.status || '')}`}>
                  Status: {gameState.boardStatus.currentObjective?.status.toUpperCase().replace('-', ' ')}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Board Satisfaction</div>
                <div className="flex items-center gap-3">
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
                  <div className="text-lg font-bold text-slate-900 dark:text-dark-text-primary">
                    {gameState.boardStatus.satisfaction}%
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 dark:text-dark-text-secondary mb-1">Job Security</div>
                <div className={`text-xl font-bold ${getJobSecurityColor(gameState.boardStatus.jobSecurity)}`}>
                  {gameState.boardStatus.jobSecurity === 'safe' && '✅ SAFE'}
                  {gameState.boardStatus.jobSecurity === 'under-pressure' && '⚠️ UNDER PRESSURE'}
                  {gameState.boardStatus.jobSecurity === 'critical' && '🚨 CRITICAL'}
                </div>
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

        {/* League Table (Collapsible) */}
        <div className="mb-6">
          <CollapsibleSection title="League Table" defaultOpen={true}>
            <div className="pt-4">
              <Link href="/table" className="block mb-3 text-right">
                <span className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                  View Full Table →
                </span>
              </Link>
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

      {/* Tactics Manager Modal */}
      {gameState && gameState.playerTeam.tactics && (
        <TacticsManager
          currentFormation={gameState.playerTeam.tactics.formation}
          currentMentality={gameState.playerTeam.tactics.mentality}
          onSave={actions.setTeamTactics}
          onClose={() => setShowTactics(false)}
          isOpen={showTactics}
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
    </div>
  );
}
