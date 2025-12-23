'use client';

import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export default function TablePage() {
  const { gameState, loading, error } = useGameState();

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
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-900 dark:text-dark-text-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <span className="text-2xl">←</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">League Table</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-dark-border-primary">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    Pos
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    Team
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    Form
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    P
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    W
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    D
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    L
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    GF
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    GA
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
                    GD
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700 dark:text-dark-text-secondary">
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
                      className={`border-b border-gray-100 dark:border-dark-border-secondary ${
                        isPlayerTeam
                          ? 'bg-teal-50 dark:bg-teal-900/20 font-semibold'
                          : isTopFour
                          ? 'bg-green-50/30 dark:bg-green-900/10'
                          : isRelegation
                          ? 'bg-red-50/30 dark:bg-red-900/10'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {index === 0 && <span className="text-yellow-500">🏆</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 dark:text-dark-text-primary">
                        {entry.teamName}
                        {isPlayerTeam && <span className="ml-2 text-teal-600 dark:text-teal-400">★</span>}
                      </td>
                      <td className="py-3 px-4">
                        <FormBadge form={getTeamForm(entry.teamId)} />
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        {entry.played}
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        {entry.won}
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        {entry.drawn}
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        {entry.lost}
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        {entry.goalsFor}
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        {entry.goalsAgainst}
                      </td>
                      <td className="text-center py-3 px-2 text-sm text-slate-700 dark:text-dark-text-secondary">
                        {entry.goalDifference > 0 ? '+' : ''}
                        {entry.goalDifference}
                      </td>
                      <td className="text-center py-3 px-2 text-sm font-bold text-teal-600 dark:text-teal-400">
                        {entry.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border-primary">
            <div className="text-sm text-slate-600 dark:text-dark-text-secondary space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded"></div>
                <span>Top 4 - European Competition</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700 rounded"></div>
                <span>Bottom 3 - Relegation Zone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-600 rounded"></div>
                <span className="font-semibold">Your Team</span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-dark-border-secondary mt-2">
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
