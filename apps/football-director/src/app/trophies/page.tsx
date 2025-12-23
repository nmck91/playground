'use client';

import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';

export default function TrophiesPage() {
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

  const seasonAwards = [...gameState.seasonAwards].reverse(); // Most recent first

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">🏆 Trophy Cabinet</h1>
              <p className="text-yellow-100 dark:text-yellow-200 mt-2">
                {seasonAwards.length} season{seasonAwards.length === 1 ? '' : 's'} of awards
              </p>
            </div>
            <Link
              href="/more"
              className="bg-white dark:bg-dark-bg-secondary text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-dark-bg-tertiary px-6 py-3 rounded-lg font-semibold transition-all"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {seasonAwards.length === 0 ? (
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
