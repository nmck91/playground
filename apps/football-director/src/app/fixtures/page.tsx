'use client';

import { useGameState } from '../../hooks/useGameState';
import { Fixture, MatchPreview } from '@playground/football-director-engine';
import Link from 'next/link';
import { useState } from 'react';
import { MatchPreviewModal } from '../../components/game/MatchPreviewModal';

export default function FixturesPage() {
  const { gameState, loading, error } = useGameState();
  const [filterType, setFilterType] = useState<'all' | 'competitive' | 'friendly'>('all');
  const [selectedPreview, setSelectedPreview] = useState<MatchPreview | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  // Get team name helper
  const getTeamName = (teamId: string) => {
    if (teamId === gameState.playerTeam.id) return gameState.playerTeam.name;
    const aiTeam = gameState.aiTeams.find(t => t.id === teamId);
    return aiTeam?.name || 'Unknown Team';
  };

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
      <div className="flex gap-1">
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

  // Filter fixtures
  const filteredFixtures = gameState.fixtures.filter(fixture => {
    if (filterType === 'all') return true;
    return fixture.matchType === filterType;
  });

  // Separate upcoming and past fixtures
  const upcomingFixtures = filteredFixtures
    .filter(f => !f.played)
    .sort((a, b) => a.week - b.week);

  const pastFixtures = filteredFixtures
    .filter(f => f.played)
    .sort((a, b) => b.week - a.week); // Most recent first

  // Check if fixture involves player team
  const isPlayerFixture = (fixture: Fixture) => {
    return fixture.homeTeamId === gameState.playerTeam.id ||
           fixture.awayTeamId === gameState.playerTeam.id;
  };

  // Get match preview for a fixture
  const getMatchPreview = (fixture: Fixture): MatchPreview | null => {
    if (!gameState.matchPreviews) return null;
    return gameState.matchPreviews.find(p => p.fixtureId === fixture.id) || null;
  };

  // Open preview modal
  const openPreview = (fixture: Fixture) => {
    const preview = getMatchPreview(fixture);
    if (preview) {
      setSelectedPreview(preview);
      setIsPreviewOpen(true);
    }
  };

  // Get result display
  const getResultDisplay = (fixture: Fixture) => {
    if (!fixture.result) return null;

    const isHome = fixture.homeTeamId === gameState.playerTeam.id;
    const isAway = fixture.awayTeamId === gameState.playerTeam.id;

    if (!isHome && !isAway) {
      // Not player's match - show both teams
      return `${fixture.result.homeScore} - ${fixture.result.awayScore}`;
    }

    // Player's match - show result with context
    const playerScore = isHome ? fixture.result.homeScore : fixture.result.awayScore;
    const opponentScore = isHome ? fixture.result.awayScore : fixture.result.homeScore;

    let resultClass = 'text-slate-700 dark:text-slate-300';
    let resultLabel = '';

    if (playerScore > opponentScore) {
      resultClass = 'text-green-600 dark:text-green-400 font-bold';
      resultLabel = 'W';
    } else if (playerScore < opponentScore) {
      resultClass = 'text-red-600 dark:text-red-400 font-bold';
      resultLabel = 'L';
    } else {
      resultClass = 'text-orange-600 dark:text-orange-400 font-bold';
      resultLabel = 'D';
    }

    return (
      <div className="flex items-center gap-2">
        <span className={resultClass}>{resultLabel}</span>
        <span className="text-slate-900 dark:text-dark-text-primary font-semibold">
          {playerScore} - {opponentScore}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-teal-500 dark:bg-dark-teal-600 text-cream-100 dark:text-dark-text-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">Fixtures</h1>
              <p className="text-teal-100 dark:text-dark-text-secondary mt-1 md:mt-2 text-sm md:text-base">
                Season {gameState.season.year} - Week {gameState.season.currentWeek}
              </p>
            </div>
            <Link
              href="/"
              className="bg-white dark:bg-dark-bg-secondary text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-dark-bg-tertiary font-medium px-3 md:px-6 py-2 md:py-3 rounded-lg shadow-sm transition-normal text-sm md:text-base"
            >
              <span className="hidden md:inline">← Back to Dashboard</span>
              <span className="md:hidden">← Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-dark-border-primary">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                filterType === 'all'
                  ? 'bg-teal-500 dark:bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-primary'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilterType('competitive')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                filterType === 'competitive'
                  ? 'bg-teal-500 dark:bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-primary'
              }`}
            >
              League
            </button>
            <button
              onClick={() => setFilterType('friendly')}
              className={`px-4 py-2 rounded-lg font-medium transition-normal ${
                filterType === 'friendly'
                  ? 'bg-teal-500 dark:bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-bg-tertiary text-slate-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-bg-primary'
              }`}
            >
              Friendlies
            </button>
          </div>
        </div>

        {/* Upcoming Fixtures */}
        {upcomingFixtures.length > 0 && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
              Upcoming Fixtures
            </h2>
            <div className="space-y-3">
              {upcomingFixtures.map((fixture) => {
                const isPlayerMatch = isPlayerFixture(fixture);
                const homeTeam = getTeamName(fixture.homeTeamId);
                const awayTeam = getTeamName(fixture.awayTeamId);
                const hasPreview = isPlayerMatch && getMatchPreview(fixture) !== null;

                return (
                  <div
                    key={fixture.id}
                    className={`p-4 rounded-lg border-2 transition-normal ${
                      isPlayerMatch
                        ? 'border-teal-300 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary min-w-[80px]">
                          Week {fixture.week}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                          {fixture.matchType === 'friendly' ? '⚽ Friendly' : '🏆 League'}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-1 justify-end flex-wrap md:flex-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`text-right ${isPlayerMatch && homeTeam === gameState.playerTeam.name ? 'font-bold text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-dark-text-primary'}`}>
                            {homeTeam}
                          </div>
                          <FormBadge form={getTeamForm(fixture.homeTeamId)} />
                        </div>
                        <div className="text-slate-400 dark:text-dark-text-tertiary font-medium">vs</div>
                        <div className="flex items-center gap-2">
                          <FormBadge form={getTeamForm(fixture.awayTeamId)} />
                          <div className={`text-left ${isPlayerMatch && awayTeam === gameState.playerTeam.name ? 'font-bold text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-dark-text-primary'}`}>
                            {awayTeam}
                          </div>
                        </div>
                        {hasPreview && (
                          <button
                            onClick={() => openPreview(fixture)}
                            className="ml-3 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-normal text-sm whitespace-nowrap"
                          >
                            📋 Preview
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Results */}
        {pastFixtures.length > 0 && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
              Results
            </h2>
            <div className="space-y-3">
              {pastFixtures.map((fixture) => {
                const isPlayerMatch = isPlayerFixture(fixture);
                const homeTeam = getTeamName(fixture.homeTeamId);
                const awayTeam = getTeamName(fixture.awayTeamId);

                return (
                  <Link
                    key={fixture.id}
                    href={`/match/${fixture.id}`}
                    className={`block p-4 rounded-lg border-2 transition-normal hover:shadow-lg cursor-pointer ${
                      isPlayerMatch
                        ? 'border-teal-300 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20 hover:border-teal-400 dark:hover:border-teal-500'
                        : 'border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary hover:border-gray-300 dark:hover:border-dark-border-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary min-w-[80px]">
                          Week {fixture.week}
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                          {fixture.matchType === 'friendly' ? '⚽ Friendly' : '🏆 League'}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-1 justify-end flex-wrap md:flex-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`text-right ${isPlayerMatch && homeTeam === gameState.playerTeam.name ? 'font-bold text-slate-900 dark:text-dark-text-primary' : 'text-slate-700 dark:text-dark-text-secondary'}`}>
                            {homeTeam}
                          </div>
                          <FormBadge form={getTeamForm(fixture.homeTeamId)} />
                        </div>
                        <div className="min-w-[80px] text-center">
                          {getResultDisplay(fixture)}
                        </div>
                        <div className="flex items-center gap-2">
                          <FormBadge form={getTeamForm(fixture.awayTeamId)} />
                          <div className={`text-left ${isPlayerMatch && awayTeam === gameState.playerTeam.name ? 'font-bold text-slate-900 dark:text-dark-text-primary' : 'text-slate-700 dark:text-dark-text-secondary'}`}>
                            {awayTeam}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* No fixtures message */}
        {upcomingFixtures.length === 0 && pastFixtures.length === 0 && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-dark-border-primary">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary mb-2">
              No {filterType !== 'all' ? filterType : ''} fixtures found
            </h3>
            <p className="text-slate-600 dark:text-dark-text-secondary">
              {filterType !== 'all'
                ? 'Try selecting a different filter to see more fixtures.'
                : 'Fixtures will appear as the season progresses.'}
            </p>
          </div>
        )}
      </main>

      {/* Match Preview Modal */}
      <MatchPreviewModal
        preview={selectedPreview}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
