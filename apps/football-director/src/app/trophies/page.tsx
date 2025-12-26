'use client';

import { useGameStore, useSaveStore } from '../../stores';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export default function TrophiesPage() {
  const gameState = useGameStore((state) => state.gameState);
  const loading = useSaveStore((state) => state.isLoading);

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

  const seasonAwards = [...gameState.seasonAwards].reverse(); // Most recent first
  const cupHistory = gameState.cupHistory || [];

  // Filter cups won by the player's team
  const cupsWon = cupHistory.filter(cup =>
    cup.winner?.teamId === gameState.playerTeam.id
  ).reverse(); // Most recent first

  const hasAnyTrophies = seasonAwards.length > 0 || cupsWon.length > 0;

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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">Trophies</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!hasAnyTrophies ? (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-dark-border-primary">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-500 dark:text-dark-text-secondary text-lg mb-2">
              No trophies yet!
            </p>
            <p className="text-gray-400 dark:text-dark-text-tertiary">
              Complete a season to earn awards
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cup Trophies */}
            {cupsWon.length > 0 && (
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-6 pb-4 border-b border-gray-200 dark:border-dark-border-secondary flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  Cup Trophies
                  <span className="ml-auto text-lg font-normal text-slate-600 dark:text-dark-text-secondary">
                    {cupsWon.length} {cupsWon.length === 1 ? 'Cup' : 'Cups'} Won
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cupsWon.map((cup) => (
                    <div
                      key={cup.id}
                      className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-lg p-6 border-2 border-yellow-400 dark:border-yellow-600 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col items-center text-center">
                        <span className="text-5xl mb-3">🏆</span>
                        <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                          {cup.name}
                        </h3>
                        <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                          {cup.season}/{cup.season + 1}
                        </p>
                        {cup.runnerUp && (
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            Beat {cup.runnerUp.teamName} in final
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Season Awards */}
            {seasonAwards.map((seasonAward) => {
              const hasAnyAward =
                seasonAward.awards.playerOfYear ||
                seasonAward.awards.goldenBoot ||
                seasonAward.awards.goldenGlove ||
                seasonAward.awards.youngPlayerOfYear;

              if (!hasAnyAward) return null;

              return (
                <div
                  key={seasonAward.season}
                  className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary"
                >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-6 pb-4 border-b border-gray-200 dark:border-dark-border-secondary">
                    Season {seasonAward.season}/{seasonAward.season + 1} Awards
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Player of the Year */}
                    {seasonAward.awards.playerOfYear && (
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 border-2 border-yellow-400 dark:border-yellow-600">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">⭐</span>
                          <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300">
                            Player of the Year
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                          {seasonAward.awards.playerOfYear.playerName}
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-2">
                          {seasonAward.awards.playerOfYear.reason}
                        </p>
                      </div>
                    )}

                    {/* Golden Boot */}
                    {seasonAward.awards.goldenBoot && (
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border-2 border-orange-400 dark:border-orange-600">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">👟</span>
                          <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300">
                            Golden Boot
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                          {seasonAward.awards.goldenBoot.playerName}
                        </p>
                        <p className="text-sm text-orange-800 dark:text-orange-400 mt-2">
                          {seasonAward.awards.goldenBoot.goals} goals
                        </p>
                      </div>
                    )}

                    {/* Golden Glove */}
                    {seasonAward.awards.goldenGlove && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border-2 border-blue-400 dark:border-blue-600">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">🧤</span>
                          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                            Golden Glove
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                          {seasonAward.awards.goldenGlove.playerName}
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-400 mt-2">
                          {seasonAward.awards.goldenGlove.cleanSheets} clean sheets
                        </p>
                      </div>
                    )}

                    {/* Young Player of the Year */}
                    {seasonAward.awards.youngPlayerOfYear && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border-2 border-purple-400 dark:border-purple-600">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">🌟</span>
                          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300">
                            Young Player of the Year
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                          {seasonAward.awards.youngPlayerOfYear.playerName}
                        </p>
                        <p className="text-sm text-purple-800 dark:text-purple-400 mt-2">
                          Age {seasonAward.awards.youngPlayerOfYear.age} • {seasonAward.awards.youngPlayerOfYear.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
