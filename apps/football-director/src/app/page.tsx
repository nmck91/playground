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
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-teal-500 text-cream-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold">⚽ Football Director</h1>
          <p className="text-teal-100 mt-2">{gameState.playerTeam.name}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Season Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            <div>
              <div className="text-sm text-slate-500 mb-1">Season</div>
              <div className="text-2xl font-bold text-slate-900">
                {gameState.season.year}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Week</div>
              <div className="text-2xl font-bold text-slate-900">
                {gameState.season.currentWeek} / {gameState.season.totalWeeks}
              </div>
              <div className="text-xs mt-1">
                {gameState.season.phase === 'pre-season' ? (
                  <span className="text-purple-600 font-semibold">🏋️ Pre-Season</span>
                ) : gameState.season.phase === 'competitive' ? (
                  <span className="text-green-600 font-semibold">⚽ Match Week</span>
                ) : (
                  <span className="text-blue-600 font-semibold">🏖️ Off-Season</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Transfer Window</div>
              <div className="text-lg font-bold">
                {gameState.season.transferWindow === 'open' ? (
                  <span className="text-green-600">✅ Open</span>
                ) : (
                  <span className="text-red-600">🔒 Closed</span>
                )}
              </div>
              <div className="text-xs mt-1 text-slate-600">
                {gameState.season.transferWindow === 'closed' && gameState.season.phase === 'competitive' && gameState.season.currentWeek < 28 && (
                  <span>Winter: Weeks 28-32</span>
                )}
                {gameState.season.transferWindow === 'open' && gameState.season.phase === 'pre-season' && (
                  <span>Closes: Week 9</span>
                )}
                {gameState.season.transferWindow === 'open' && gameState.season.phase === 'competitive' && (
                  <span>Closes: Week 33</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">League Position</div>
              <div className="text-2xl font-bold text-teal-600">
                {playerPosition}
                {playerPosition === 1 && '🏆'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Budget</div>
              <div className="text-2xl font-bold text-slate-900">
                £{gameState.finances.budget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Board Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Board Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-500 mb-1">Season Objective</div>
              <div className="text-base font-medium text-slate-900 mb-2">
                {gameState.boardStatus.currentObjective?.description}
              </div>
              <div className={`text-sm font-semibold ${getObjectiveStatusColor(gameState.boardStatus.currentObjective?.status || '')}`}>
                Status: {gameState.boardStatus.currentObjective?.status.toUpperCase().replace('-', ' ')}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Board Satisfaction</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
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
                <div className="text-lg font-bold text-slate-900">
                  {gameState.boardStatus.satisfaction}%
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Job Security</div>
              <div className={`text-2xl font-bold ${getJobSecurityColor(gameState.boardStatus.jobSecurity)}`}>
                {gameState.boardStatus.jobSecurity === 'safe' && '✅ SAFE'}
                {gameState.boardStatus.jobSecurity === 'under-pressure' && '⚠️ UNDER PRESSURE'}
                {gameState.boardStatus.jobSecurity === 'critical' && '🚨 CRITICAL'}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <button
            onClick={actions.simulateNextWeek}
            disabled={isSeasonComplete}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-md transition-normal disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isSeasonComplete
              ? '✅ Season Complete'
              : gameState.season.phase === 'pre-season' && [4, 5, 6].includes(gameState.season.currentWeek)
              ? '⚽ Play Friendly'
              : gameState.season.phase === 'pre-season'
              ? '▶️ Continue Pre-Season'
              : gameState.season.phase === 'off-season'
              ? '▶️ Continue Off-Season'
              : '▶️ Simulate Next Week'}
          </button>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link
              href="/squad"
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition-all text-center"
            >
              <div className="text-2xl mb-1">👥</div>
              <div className="text-sm">Squad</div>
            </Link>
            <Link
              href="/transfers"
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition-all text-center"
            >
              <div className="text-2xl mb-1">💰</div>
              <div className="text-sm">Transfers</div>
            </Link>
            <Link
              href="/fixtures"
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition-all text-center"
            >
              <div className="text-2xl mb-1">📅</div>
              <div className="text-sm">Fixtures</div>
            </Link>
            <button
              onClick={() => setShowTactics(true)}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition-all text-center"
            >
              <div className="text-2xl mb-1">⚙️</div>
              <div className="text-sm">Tactics</div>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-full bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition-all text-center"
              >
                <div className="text-2xl mb-1">⋯</div>
                <div className="text-sm">More</div>
              </button>

              {/* Dropdown Menu */}
              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                  <Link
                    href="/table"
                    className="block px-4 py-3 hover:bg-gray-50 transition-normal border-b border-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <span className="mr-2">📋</span> Table
                  </Link>
                  <Link
                    href="/stats"
                    className="block px-4 py-3 hover:bg-gray-50 transition-normal border-b border-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <span className="mr-2">📊</span> Stats
                  </Link>
                  <Link
                    href="/staff"
                    className="block px-4 py-3 hover:bg-gray-50 transition-normal border-b border-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <span className="mr-2">👔</span> Staff
                  </Link>
                  <button
                    onClick={() => {
                      setShowRecords(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-normal border-b border-gray-100"
                  >
                    <span className="mr-2">🏅</span> Records
                  </button>
                  <button
                    onClick={() => {
                      setShowTrophyCabinet(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-normal border-b border-gray-100"
                  >
                    <span className="mr-2">🏆</span> Trophies
                  </button>
                  <button
                    onClick={() => {
                      setShowNewsFeed(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-normal border-b border-gray-100 relative"
                  >
                    <span className="mr-2">📰</span> News
                    {gameState.newsFeed.filter(n => !n.read).length > 0 && (
                      <span className="absolute right-3 top-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {gameState.newsFeed.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this save? This cannot be undone.')) {
                        actions.deleteSave();
                      }
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-semibold transition-normal rounded-b-lg"
                  >
                    <span className="mr-2">🗑️</span> Delete Save
                  </button>
                </div>
              )}
            </div>
          </div>
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

        {/* League Table */}
        <Link href="/table" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                League Table
              </h2>
              <span className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View Full Table →
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">
                      Pos
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Team
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      P
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      W
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      D
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      L
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      GF
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      GA
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      GD
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {condensedTable.map((entry) => {
                    const position = sortedTable.findIndex(t => t.teamId === entry.teamId) + 1;
                    return (
                      <tr
                        key={entry.teamId}
                        className={`border-b border-gray-100 ${
                          entry.teamId === gameState.playerTeam.id
                            ? 'bg-teal-50 font-semibold'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-2 text-sm text-slate-700">
                          {position}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900">
                          {entry.teamName}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {entry.played}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {entry.won}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {entry.drawn}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {entry.lost}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {entry.goalsFor}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {entry.goalsAgainst}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {entry.goalDifference > 0 ? '+' : ''}
                          {entry.goalDifference}
                        </td>
                        <td className="text-center py-3 px-2 text-sm font-bold text-teal-600">
                          {entry.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Link>
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
