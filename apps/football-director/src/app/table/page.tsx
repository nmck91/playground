'use client';

import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';

export default function TablePage() {
  const { gameState, loading, error } = useGameState();

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

  // Get team's last 5 results for form guide
  const getTeamForm = (teamId: string): ('W' | 'D' | 'L')[] => {
    const teamFixtures = gameState.fixtures
      .filter(f => f.played && (f.homeTeamId === teamId || f.awayTeamId === teamId))
      .sort((a, b) => b.week - a.week)
      .slice(0, 5);

    return teamFixtures.map(fixture => {
      if (!fixture.result) return 'L';

      const isHome = fixture.homeTeamId === teamId;
      const teamScore = isHome ? fixture.result.homeScore : fixture.result.awayScore;
      const oppScore = isHome ? fixture.result.awayScore : fixture.result.homeScore;

      if (teamScore > oppScore) return 'W';
      if (teamScore < oppScore) return 'L';
      return 'D';
    });
  };

  // Form badge component
  const FormBadge = ({ form }: { form: ('W' | 'D' | 'L')[] }) => {
    if (form.length === 0) return null;

    return (
      <div className="flex gap-1 justify-center">
        {form.map((result, index) => (
          <div
            key={index}
            className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold text-white ${
              result === 'W'
                ? 'bg-green-500'
                : result === 'D'
                ? 'bg-orange-400'
                : 'bg-red-500'
            }`}
            title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
          >
            {result}
          </div>
        ))}
      </div>
    );
  };

  const sortedTable = gameState.leagueTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-teal-500 text-cream-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">League Table</h1>
              <p className="text-teal-100 mt-1 md:mt-2 text-sm md:text-base">
                Season {gameState.season.year} - Week {gameState.season.currentWeek}
              </p>
            </div>
            <Link
              href="/"
              className="bg-white text-teal-600 hover:bg-teal-50 font-medium px-3 md:px-6 py-2 md:py-3 rounded-lg shadow-sm transition-normal text-sm md:text-base"
            >
              <span className="hidden md:inline">← Back to Dashboard</span>
              <span className="md:hidden">← Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
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
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Form
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
                {sortedTable.map((entry, index) => {
                  const isPlayerTeam = entry.teamId === gameState.playerTeam.id;
                  const isTopFour = index < 4;
                  const isRelegation = index >= sortedTable.length - 3;

                  return (
                    <tr
                      key={entry.teamId}
                      className={`border-b border-gray-100 ${
                        isPlayerTeam
                          ? 'bg-teal-50 font-semibold'
                          : isTopFour
                          ? 'bg-green-50/30'
                          : isRelegation
                          ? 'bg-red-50/30'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-2 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {index === 0 && <span className="text-yellow-500">🏆</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {entry.teamName}
                        {isPlayerTeam && <span className="ml-2 text-teal-600">★</span>}
                      </td>
                      <td className="py-3 px-4">
                        <FormBadge form={getTeamForm(entry.teamId)} />
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

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-slate-600 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                <span>Top 4 - European Competition</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                <span>Bottom 3 - Relegation Zone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-teal-50 border border-teal-200 rounded"></div>
                <span className="font-semibold">Your Team</span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 mt-2">
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  <div className="w-4 h-4 bg-orange-400 rounded-sm"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                </div>
                <span>Form: Last 5 matches (Green = Win, Orange = Draw, Red = Loss)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
