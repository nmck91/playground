'use client';

import { useGameStore, useSaveStore } from '../../stores';
import { CupFixture, CupRound } from '@playground/football-director-engine';

export default function CupPage() {
  const gameState = useGameStore((state) => state.gameState);
  const loading = useSaveStore((state) => state.isLoading);
  const error = useSaveStore((state) => state.loadError);

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

  const cup = gameState.cupCompetition;
  const cupHistory = gameState.cupHistory || [];

  if (!cup && cupHistory.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary mb-6">
            Cup Competition
          </h1>
          <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow">
            <p className="text-slate-600 dark:text-dark-text-secondary">
              No cup competition data available for this season.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getRoundName = (roundNumber: number): string => {
    const names: Record<number, string> = {
      1: 'Round 1',
      2: 'Round 2',
      3: 'Round 3',
      4: 'Quarter-Finals',
      5: 'Semi-Finals',
      6: 'Final',
    };
    return names[roundNumber] || `Round ${roundNumber}`;
  };

  const renderFixture = (fixture: CupFixture, isPlayerInvolved: boolean) => {
    const result = fixture.result;

    return (
      <div
        key={fixture.id}
        className={`p-4 rounded-lg ${
          isPlayerInvolved
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            : 'bg-white dark:bg-dark-bg-tertiary'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium ${
                result?.winnerId === fixture.homeTeamId
                  ? 'text-green-600 dark:text-green-400'
                  : fixture.played
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-900 dark:text-dark-text-primary'
              }`}>
                {fixture.homeTeamName}
                {fixture.homeTeamId === gameState.playerTeam.id && (
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                    YOU
                  </span>
                )}
              </span>
              {result && (
                <span className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                  {result.homeScore}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${
                result?.winnerId === fixture.awayTeamId
                  ? 'text-green-600 dark:text-green-400'
                  : fixture.played
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-900 dark:text-dark-text-primary'
              }`}>
                {fixture.awayTeamName}
                {fixture.awayTeamId === gameState.playerTeam.id && (
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                    YOU
                  </span>
                )}
              </span>
              {result && (
                <span className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                  {result.awayScore}
                </span>
              )}
            </div>
          </div>
        </div>

        {result && (result.wentToExtraTime || result.wentToPenalties) && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2 text-xs">
              {result.wentToExtraTime && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                  AET
                </span>
              )}
              {result.wentToPenalties && result.penaltyScore && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                  Pens {result.penaltyScore.home}-{result.penaltyScore.away}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-dark-text-secondary">
              Winner: <span className="font-semibold text-green-600 dark:text-green-400">
                {result.winnerName}
              </span>
            </div>
          </div>
        )}

        {!fixture.played && (
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Week {fixture.weekNumber}
          </div>
        )}
      </div>
    );
  };

  const renderRound = (round: CupRound) => {
    const playerFixtures = round.fixtures.filter(
      f => f.homeTeamId === gameState.playerTeam.id || f.awayTeamId === gameState.playerTeam.id
    );
    const otherFixtures = round.fixtures.filter(
      f => f.homeTeamId !== gameState.playerTeam.id && f.awayTeamId !== gameState.playerTeam.id
    );

    return (
      <div key={round.roundNumber} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">
            {round.roundName}
          </h2>
          <div className="text-sm text-slate-600 dark:text-dark-text-secondary">
            Week {round.weekNumber}
            {round.completed && (
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                COMPLETED
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {playerFixtures.map(fixture => renderFixture(fixture, true))}
          {otherFixtures.map(fixture => renderFixture(fixture, false))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {cup && (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary mb-2">
                {cup.name} {cup.season}
              </h1>
              {cup.completed && cup.winner && (
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🏆</span>
                    <div>
                      <div className="text-white font-bold text-xl">
                        {cup.winner.teamName}
                      </div>
                      <div className="text-yellow-100 text-sm">
                        {cup.name} Champions
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!cup.completed && (
                <div className="text-slate-600 dark:text-dark-text-secondary">
                  Current Round: {getRoundName(cup.currentRound)}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {cup.rounds.map(round => renderRound(round))}
            </div>
          </>
        )}

        {cupHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
              Cup History
            </h2>
            <div className="space-y-3">
              {cupHistory.map(historicCup => (
                <div
                  key={historicCup.id}
                  className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-dark-text-primary">
                        {historicCup.name} {historicCup.season}
                      </div>
                      {historicCup.winner && (
                        <div className="text-sm text-slate-600 dark:text-dark-text-secondary mt-1">
                          Winner: <span className="font-semibold text-green-600 dark:text-green-400">
                            {historicCup.winner.teamName}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
