'use client';

import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export default function RecordsPage() {
  const { gameState, loading } = useGameState();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-900 dark:text-dark-text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-600 dark:text-dark-text-secondary">No active game. Start a new game first.</div>
      </div>
    );
  }

  const records = gameState.clubRecords;

  const RecordCard = ({ icon, title, value, subtitle }: { icon: string; title: string; value: string; subtitle: string }) => (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 border border-gray-200 dark:border-dark-border-primary hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary mb-1">
        {value}
      </p>
      <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
        {subtitle}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/more" className="text-slate-900 dark:text-dark-text-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <span className="text-2xl">←</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">Records</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* League Performance Records */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
            🏆 League Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RecordCard
              icon="🥇"
              title="Best League Position"
              value={`${records.bestLeaguePosition.position}${getOrdinalSuffix(records.bestLeaguePosition.position)}`}
              subtitle={`Season ${records.bestLeaguePosition.season}/${records.bestLeaguePosition.season + 1}`}
            />
            <RecordCard
              icon="⭐"
              title="Most Points"
              value={`${records.mostPoints.points}`}
              subtitle={`Season ${records.mostPoints.season}/${records.mostPoints.season + 1}`}
            />
            <RecordCard
              icon="✅"
              title="Most Wins"
              value={`${records.mostWins.wins}`}
              subtitle={`Season ${records.mostWins.season}/${records.mostWins.season + 1}`}
            />
          </div>
        </section>

        {/* Goal Records */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
            ⚽ Goal Records
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RecordCard
              icon="🎯"
              title="Most Goals Scored"
              value={`${records.mostGoalsScored.goals}`}
              subtitle={`Season ${records.mostGoalsScored.season}/${records.mostGoalsScored.season + 1}`}
            />
            <RecordCard
              icon="🛡️"
              title="Fewest Goals Conceded"
              value={`${records.fewestGoalsConceded.goals}`}
              subtitle={`Season ${records.fewestGoalsConceded.season}/${records.fewestGoalsConceded.season + 1}`}
            />
            <RecordCard
              icon="📊"
              title="Best Goal Difference"
              value={`+${records.bestGoalDifference.difference}`}
              subtitle={`Season ${records.bestGoalDifference.season}/${records.bestGoalDifference.season + 1}`}
            />
          </div>
        </section>

        {/* Match Records */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
            🏅 Match Records
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border-2 border-green-400 dark:border-green-600">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🔥</span>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-300">
                  Biggest Win
                </h3>
              </div>
              <p className="text-3xl font-bold text-green-900 dark:text-green-200 mb-2">
                {records.biggestWin.score}
              </p>
              <p className="text-sm text-green-800 dark:text-green-400">
                vs {records.biggestWin.opponent} ({records.biggestWin.homeOrAway})
              </p>
              <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                Week {records.biggestWin.week}, Season {records.biggestWin.season}/{records.biggestWin.season + 1}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border-2 border-blue-400 dark:border-blue-600">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🧤</span>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                  Most Clean Sheets (Season)
                </h3>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-200 mb-2">
                {records.mostCleanSheetsSeason.cleanSheets}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Season {records.mostCleanSheetsSeason.season}/{records.mostCleanSheetsSeason.season + 1}
              </p>
            </div>
          </div>
        </section>

        {/* Streak Records */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
            📈 Winning Streaks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecordCard
              icon="🏃"
              title="Longest Win Streak"
              value={`${records.longestWinStreak.streak} games`}
              subtitle={`Season ${records.longestWinStreak.season}/${records.longestWinStreak.season + 1}`}
            />
            <RecordCard
              icon="💪"
              title="Longest Unbeaten Streak"
              value={`${records.longestUnbeatenStreak.streak} games`}
              subtitle={`Season ${records.longestUnbeatenStreak.season}/${records.longestUnbeatenStreak.season + 1}`}
            />
          </div>
        </section>

        {/* Player Records */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
            👤 Player Records
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6 border-2 border-amber-400 dark:border-amber-600">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">⚽</span>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">
                  Most Goals (Single Season)
                </h3>
              </div>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-200 mb-2">
                {records.mostGoalsSingleSeason.goals} goals
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-400">
                {records.mostGoalsSingleSeason.playerName}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                Season {records.mostGoalsSingleSeason.season}/{records.mostGoalsSingleSeason.season + 1}
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-6 border-2 border-teal-400 dark:border-teal-600">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🎯</span>
                <h3 className="text-lg font-bold text-teal-900 dark:text-teal-300">
                  Most Assists (Single Season)
                </h3>
              </div>
              <p className="text-3xl font-bold text-teal-900 dark:text-teal-200 mb-2">
                {records.mostAssistsSingleSeason.assists} assists
              </p>
              <p className="text-sm text-teal-800 dark:text-teal-400">
                {records.mostAssistsSingleSeason.playerName}
              </p>
              <p className="text-xs text-teal-700 dark:text-teal-500 mt-1">
                Season {records.mostAssistsSingleSeason.season}/{records.mostAssistsSingleSeason.season + 1}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function getOrdinalSuffix(position: number): string {
  const lastDigit = position % 10;
  const lastTwoDigits = position % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
