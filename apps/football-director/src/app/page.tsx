'use client';

import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { MatchHighlights } from '../components/game/MatchHighlights';
import { DevelopmentReport } from '../components/game/DevelopmentReport';
import { SeasonEvaluation } from '../components/game/SeasonEvaluation';
import Link from 'next/link';

export default function Dashboard() {
  const { gameState, loading, error, lastSimulationResults, developmentReports, seasonEvaluation, actions } = useGameState();
  const [showHighlights, setShowHighlights] = useState(false);
  const [showDevelopment, setShowDevelopment] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Show highlights after simulation
  useEffect(() => {
    if (lastSimulationResults && lastSimulationResults.length > 0) {
      setShowHighlights(true);
    }
  }, [lastSimulationResults]);

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
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-md">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center">
            ⚽ Football Director
          </h1>
          <p className="text-slate-600 mb-8 text-center">
            Manage your football club to glory!
          </p>
          <button
            onClick={actions.newGame}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-normal"
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  const playerPosition =
    gameState.leagueTable
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      })
      .findIndex((entry) => entry.teamId === gameState.playerTeam.id) + 1;

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={actions.simulateNextWeek}
              disabled={isSeasonComplete}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeasonComplete ? 'Season Complete' : 'Simulate Next Week'}
            </button>
            <Link
              href="/squad"
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-normal inline-flex items-center"
            >
              👥 Squad Management
            </Link>
            <Link
              href="/transfers"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-normal inline-flex items-center"
            >
              💰 Transfer Market
            </Link>
            <button
              onClick={actions.deleteSave}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-normal"
            >
              Delete Save
            </button>
          </div>
        </div>

        {/* League Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            League Table
          </h2>
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
                {gameState.leagueTable
                  .sort((a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    if (b.goalDifference !== a.goalDifference)
                      return b.goalDifference - a.goalDifference;
                    return b.goalsFor - a.goalsFor;
                  })
                  .map((entry, index) => (
                    <tr
                      key={entry.teamId}
                      className={`border-b border-gray-100 ${
                        entry.teamId === gameState.playerTeam.id
                          ? 'bg-teal-50 font-semibold'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-2 text-sm text-slate-700">
                        {index + 1}
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
                  ))}
              </tbody>
            </table>
          </div>
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
          onContinue={() => setShowEvaluation(false)}
          onGameOver={() => {
            actions.deleteSave();
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
