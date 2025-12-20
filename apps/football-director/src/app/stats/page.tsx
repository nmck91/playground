'use client';

import { useGameState } from '../../hooks/useGameState';
import { Player } from '@playground/football-director-engine';
import Link from 'next/link';
import { useState } from 'react';

type TabType = 'scorers' | 'assisters' | 'teams';

export default function StatsPage() {
  const { gameState, loading, error } = useGameState();
  const [activeTab, setActiveTab] = useState<TabType>('scorers');

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
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-slate-900 text-xl">No game state found</div>
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
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-teal-500 text-cream-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-cream-100 hover:text-white transition-normal"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-4xl font-bold">League Statistics</h1>
              <p className="text-teal-100 mt-2">
                Season {gameState.season.year} - Week {gameState.season.currentWeek}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('scorers')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                activeTab === 'scorers'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              ⚽ Top Scorers
            </button>
            <button
              onClick={() => setActiveTab('assisters')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                activeTab === 'assisters'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              🎯 Top Assisters
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                activeTab === 'teams'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              📊 Team Stats
            </button>
          </div>
        </div>

        {/* Top Scorers Tab */}
        {activeTab === 'scorers' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Top Scorers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Player
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Team
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      Apps
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      Goals
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
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
                        className={`border-b border-gray-100 ${
                          isPlayerTeamPlayer ? 'bg-teal-50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            {index + 1}
                            {index === 0 && <span className="text-yellow-500">🥇</span>}
                            {index === 1 && <span className="text-gray-400">🥈</span>}
                            {index === 2 && <span className="text-orange-600">🥉</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900">
                          {player.name}
                          <span className="text-xs text-slate-500 ml-2">
                            ({player.position})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700">
                          {player.teamName}
                          {isPlayerTeamPlayer && <span className="ml-2 text-teal-600">★</span>}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {player.stats.appearances}
                        </td>
                        <td className="text-center py-3 px-2 text-sm font-bold text-teal-600">
                          {player.stats.goals}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-600">
                          {goalsPerGame}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {topScorers.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No goals scored yet this season.
              </div>
            )}
          </div>
        )}

        {/* Top Assisters Tab */}
        {activeTab === 'assisters' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Top Assisters
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Player
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Team
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      Apps
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
                      Assists
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">
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
                        className={`border-b border-gray-100 ${
                          isPlayerTeamPlayer ? 'bg-teal-50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            {index + 1}
                            {index === 0 && <span className="text-yellow-500">🥇</span>}
                            {index === 1 && <span className="text-gray-400">🥈</span>}
                            {index === 2 && <span className="text-orange-600">🥉</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900">
                          {player.name}
                          <span className="text-xs text-slate-500 ml-2">
                            ({player.position})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700">
                          {player.teamName}
                          {isPlayerTeamPlayer && <span className="ml-2 text-teal-600">★</span>}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-700">
                          {player.stats.appearances}
                        </td>
                        <td className="text-center py-3 px-2 text-sm font-bold text-purple-600">
                          {player.stats.assists}
                        </td>
                        <td className="text-center py-3 px-2 text-sm text-slate-600">
                          {assistsPerGame}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {topAssisters.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No assists recorded yet this season.
              </div>
            )}
          </div>
        )}

        {/* Team Statistics Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Best Attack */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                🔥 Best Attack (Goals Scored)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Goals Scored</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teamStats]
                      .sort((a, b) => b.goalsScored - a.goalsScored)
                      .slice(0, 10)
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className={`border-b border-gray-100 ${
                            isPlayerTeam(team.name) ? 'bg-teal-50 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm text-slate-700">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-slate-900">
                            {team.name}
                            {isPlayerTeam(team.name) && <span className="ml-2 text-teal-600">★</span>}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-green-600">
                            {team.goalsScored}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Best Defense */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                🛡️ Best Defense (Fewest Goals Conceded)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Goals Conceded</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Clean Sheets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teamStats]
                      .sort((a, b) => a.goalsConceded - b.goalsConceded)
                      .slice(0, 10)
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className={`border-b border-gray-100 ${
                            isPlayerTeam(team.name) ? 'bg-teal-50 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm text-slate-700">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-slate-900">
                            {team.name}
                            {isPlayerTeam(team.name) && <span className="ml-2 text-teal-600">★</span>}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-blue-600">
                            {team.goalsConceded}
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-slate-600">
                            {team.cleanSheets}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Discipline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                🟨 Discipline (Cards)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Yellow Cards</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Red Cards</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...teamStats]
                      .sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2))
                      .slice(0, 10)
                      .map((team, index) => (
                        <tr
                          key={team.id}
                          className={`border-b border-gray-100 ${
                            isPlayerTeam(team.name) ? 'bg-teal-50 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm text-slate-700">{index + 1}</td>
                          <td className="py-3 px-4 text-sm text-slate-900">
                            {team.name}
                            {isPlayerTeam(team.name) && <span className="ml-2 text-teal-600">★</span>}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-yellow-600">
                            {team.yellowCards}
                          </td>
                          <td className="text-center py-3 px-2 text-sm font-bold text-red-600">
                            {team.redCards}
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-slate-700">
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
