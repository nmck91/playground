'use client';

import { useGameState } from '../../hooks/useGameState';
import { Player } from '@playground/football-director-engine';
import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

type TabType = 'scorers' | 'assisters' | 'teams';

export default function StatsPage() {
  const { gameState, loading, error } = useGameState();
  const [activeTab, setActiveTab] = useState<TabType>('scorers');

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

  // Aggregate all players from all teams
  const allPlayers: Array<Player & { teamName: string }> = [];

  gameState.playerTeam.players.forEach(player => {
    allPlayers.push({ ...player, teamName: gameState.playerTeam.name });
  });

  gameState.aiTeams.forEach(team => {
    team.players.forEach(player => {
      allPlayers.push({ ...player, teamName: team.name });
    });
  });

  // Filter players with at least 1 appearance
  const activePlayers = allPlayers.filter(p => p.stats.appearances > 0);

  // Top Scorers (sorted by goals, then by goals per game)
  const topScorers = [...activePlayers]
    .sort((a, b) => {
      if (b.stats.goals !== a.stats.goals) return b.stats.goals - a.stats.goals;
      // If goals are equal, sort by goals per game
      const aGpg = a.stats.goals / Math.max(1, a.stats.appearances);
      const bGpg = b.stats.goals / Math.max(1, b.stats.appearances);
      return bGpg - aGpg;
    })
    .slice(0, 20);

  // Top Assisters
  const topAssisters = [...activePlayers]
    .sort((a, b) => {
      if (b.stats.assists !== a.stats.assists) return b.stats.assists - a.stats.assists;
      // If assists are equal, sort by assists per game
      const aApg = a.stats.assists / Math.max(1, a.stats.appearances);
      const bApg = b.stats.assists / Math.max(1, b.stats.appearances);
      return bApg - aApg;
    })
    .slice(0, 20);

  // Team Statistics
  const teamStats = [gameState.playerTeam, ...gameState.aiTeams].map(team => {
    const leagueEntry = gameState.leagueTable.find(t => t.teamId === team.id);

    return {
      name: team.name,
      id: team.id,
      goalsScored: leagueEntry?.goalsFor || 0,
      goalsConceded: leagueEntry?.goalsAgainst || 0,
      goalDifference: leagueEntry?.goalDifference || 0,
      cleanSheets: team.players
        .filter(p => p.position === 'GK')
        .reduce((sum, p) => sum + p.stats.cleanSheets, 0),
      yellowCards: team.players.reduce((sum, p) => sum + p.stats.yellowCards, 0),
      redCards: team.players.reduce((sum, p) => sum + p.stats.redCards, 0),
    };
  });

  const isPlayerTeam = (teamName: string) => teamName === gameState.playerTeam.name;

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-900 dark:text-dark-text-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <span className="text-2xl">←</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">Statistics</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-dark-border-primary">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('scorers')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                activeTab === 'scorers'
                  ? 'bg-teal-500 dark:bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-primary'
              }`}
            >
              ⚽ Top Scorers
            </button>
            <button
              onClick={() => setActiveTab('assisters')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                activeTab === 'assisters'
                  ? 'bg-teal-500 dark:bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-primary'
              }`}
            >
              🎯 Top Assisters
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                activeTab === 'teams'
                  ? 'bg-teal-500 dark:bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-primary'
              }`}
            >
              📊 Team Stats
            </button>
          </div>
        </div>

        {/* Top Scorers Tab */}
        {activeTab === 'scorers' && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
              Top Scorers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-dark-border-primary">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Player
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Team
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Apps
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Goals
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Goals/Game
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topScorers.map((player, index) => {
                    const goalsPerGame = (player.stats.goals / Math.max(1, player.stats.appearances)).toFixed(2);
                    const isPlayerTeamPlayer = isPlayerTeam(player.teamName);

                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-gray-100 dark:border-dark-border-secondary ${
                          isPlayerTeamPlayer ? 'bg-teal-50 dark:bg-teal-900/20 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                          <div className="flex items-center gap-2">
                            {index + 1}
                            {index === 0 && <span className="text-yellow-500">🥇</span>}
                            {index === 1 && <span className="text-gray-400">🥈</span>}
                            {index === 2 && <span className="text-orange-600 dark:text-orange-400">🥉</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900 dark:text-dark-text-primary">
                          {player.name}
                          <span className="text-xs text-slate-500 dark:text-dark-text-tertiary ml-2">
                            ({player.position})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-dark-text-secondary">
                          {player.teamName}
                          {isPlayerTeamPlayer && <span className="ml-2 text-teal-600 dark:text-teal-400">★</span>}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                          {player.stats.appearances}
                        </td>
                        <td className="text-center py-3 px-2 text-sm font-bold text-teal-600 dark:text-teal-400">
                          {player.stats.goals}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-600 dark:text-dark-text-tertiary">
                          {goalsPerGame}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {topScorers.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-dark-text-secondary">
                No goals scored yet this season.
              </div>
            )}
          </div>
        )}

        {/* Top Assisters Tab */}
        {activeTab === 'assisters' && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
              Top Assisters
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-dark-border-primary">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Player
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Team
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Apps
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Assists
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                      Assists/Game
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topAssisters.map((player, index) => {
                    const assistsPerGame = (player.stats.assists / Math.max(1, player.stats.appearances)).toFixed(2);
                    const isPlayerTeamPlayer = isPlayerTeam(player.teamName);

                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-gray-100 dark:border-dark-border-secondary ${
                          isPlayerTeamPlayer ? 'bg-teal-50 dark:bg-teal-900/20 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                          <div className="flex items-center gap-2">
                            {index + 1}
                            {index === 0 && <span className="text-yellow-500">🥇</span>}
                            {index === 1 && <span className="text-gray-400">🥈</span>}
                            {index === 2 && <span className="text-orange-600 dark:text-orange-400">🥉</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900 dark:text-dark-text-primary">
                          {player.name}
                          <span className="text-xs text-slate-500 dark:text-dark-text-tertiary ml-2">
                            ({player.position})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700 dark:text-dark-text-secondary">
                          {player.teamName}
                          {isPlayerTeamPlayer && <span className="ml-2 text-teal-600 dark:text-teal-400">★</span>}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                          {player.stats.appearances}
                        </td>
                        <td className="text-center py-3 px-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                          {player.stats.assists}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-600 dark:text-dark-text-tertiary">
                          {assistsPerGame}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {topAssisters.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-dark-text-secondary">
                No assists recorded yet this season.
              </div>
            )}
          </div>
        )}

        {/* Team Statistics Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Best Attack */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
                🔥 Best Attack (Goals Scored)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-dark-border-primary">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Goals Scored</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teamStats]
                      .sort((a, b) => b.goalsScored - a.goalsScored)
                      .slice(0, 10)
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className={`border-b border-gray-100 dark:border-dark-border-secondary ${
                            isPlayerTeam(team.name) ? 'bg-teal-50 dark:bg-teal-900/20 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-dark-text-primary">
                            {team.name}
                            {isPlayerTeam(team.name) && <span className="ml-2 text-teal-600 dark:text-teal-400">★</span>}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-green-600 dark:text-green-400">
                            {team.goalsScored}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Best Defense */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
                🛡️ Best Defense (Fewest Goals Conceded)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-dark-border-primary">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Goals Conceded</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Clean Sheets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teamStats]
                      .sort((a, b) => a.goalsConceded - b.goalsConceded)
                      .slice(0, 10)
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className={`border-b border-gray-100 dark:border-dark-border-secondary ${
                            isPlayerTeam(team.name) ? 'bg-teal-50 dark:bg-teal-900/20 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-dark-text-primary">
                            {team.name}
                            {isPlayerTeam(team.name) && <span className="ml-2 text-teal-600 dark:text-teal-400">★</span>}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                            {team.goalsConceded}
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-slate-600 dark:text-dark-text-tertiary">
                            {team.cleanSheets}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Discipline */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
                🟨 Discipline (Cards)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-dark-border-primary">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Yellow Cards</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Red Cards</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teamStats]
                      .sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2))
                      .slice(0, 10)
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className={`border-b border-gray-100 dark:border-dark-border-secondary ${
                            isPlayerTeam(team.name) ? 'bg-teal-50 dark:bg-teal-900/20 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-dark-text-primary">
                            {team.name}
                            {isPlayerTeam(team.name) && <span className="ml-2 text-teal-600 dark:text-teal-400">★</span>}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                            {team.yellowCards}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-red-600 dark:text-red-400">
                            {team.redCards}
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                            {team.yellowCards + team.redCards}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
