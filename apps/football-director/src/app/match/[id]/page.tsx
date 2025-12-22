'use client';

import { useGameState } from '../../../hooks/useGameState';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function MatchDetailsPage() {
  const { gameState, loading, error } = useGameState();
  const params = useParams();
  const fixtureId = params.id as string;
  const [ratingsSortBy, setRatingsSortBy] = useState<'rating' | 'name'>('rating');

  // Weather emoji mapping
  const weatherEmoji: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    foggy: '🌫️',
    snowy: '❄️',
  };

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

  // Find the fixture
  const fixture = gameState.fixtures.find(f => f.id === fixtureId);

  if (!fixture) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Match not found</div>
          <div className="text-sm text-slate-600">
            Looking for fixture ID: {fixtureId}
          </div>
          <div className="text-sm text-slate-600 mt-2">
            Total fixtures: {gameState.fixtures.length}
          </div>
        </div>
      </div>
    );
  }

  if (!fixture.played || !fixture.result) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 text-xl mb-4">Match has not been played yet</div>
          <div className="text-sm text-slate-500">
            This fixture is scheduled for Week {fixture.week}
          </div>
          <Link
            href="/fixtures"
            className="inline-block mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
          >
            Back to Fixtures
          </Link>
        </div>
      </div>
    );
  }

  const result = fixture.result;

  // Helper to get team name
  const getTeamName = (teamId: string) => {
    if (teamId === gameState.playerTeam.id) return gameState.playerTeam.name;
    const aiTeam = gameState.aiTeams.find(t => t.id === teamId);
    return aiTeam?.name || 'Unknown Team';
  };

  const homeTeamName = getTeamName(fixture.homeTeamId);
  const awayTeamName = getTeamName(fixture.awayTeamId);
  const isPlayerMatch = fixture.homeTeamId === gameState.playerTeam.id ||
                       fixture.awayTeamId === gameState.playerTeam.id;

  // Sort events by minute
  const sortedEvents = (result.events || []).sort((a, b) => a.minute - b.minute);

  // Get result label for player's team
  let resultLabel = '';
  let resultClass = '';
  if (isPlayerMatch) {
    const isHome = fixture.homeTeamId === gameState.playerTeam.id;
    const playerScore = isHome ? result.homeScore : result.awayScore;
    const opponentScore = isHome ? result.awayScore : result.homeScore;

    if (playerScore > opponentScore) {
      resultLabel = 'Win';
      resultClass = 'text-green-600';
    } else if (playerScore < opponentScore) {
      resultLabel = 'Loss';
      resultClass = 'text-red-600';
    } else {
      resultLabel = 'Draw';
      resultClass = 'text-orange-600';
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-teal-500 text-cream-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">Match Report</h1>
              <p className="text-teal-100 mt-1 md:mt-2 text-sm md:text-base">
                Week {fixture.week} - {fixture.matchType === 'friendly' ? 'Friendly' : 'League Match'}
              </p>
            </div>
            <Link
              href="/fixtures"
              className="bg-white text-teal-600 hover:bg-teal-50 font-medium px-3 md:px-6 py-2 md:py-3 rounded-lg shadow-sm transition-normal text-sm md:text-base"
            >
              <span className="hidden md:inline">← Back to Fixtures</span>
              <span className="md:hidden">← Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Match Score Card */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${isPlayerMatch ? 'border-2 border-teal-300' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">
                {fixture.matchType === 'friendly' ? '⚽ Friendly Match' : '🏆 League Match'}
              </div>
              {result.isDerby && (
                <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  🔥 DERBY
                </span>
              )}
            </div>
            {isPlayerMatch && resultLabel && (
              <div className={`text-lg font-bold ${resultClass}`}>
                {resultLabel}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-8">
            {/* Home Team */}
            <div className="flex-1 text-right">
              <h2 className={`text-2xl md:text-3xl font-bold ${fixture.homeTeamId === gameState.playerTeam.id ? 'text-teal-600' : 'text-slate-900'}`}>
                {homeTeamName}
              </h2>
            </div>

            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="text-4xl md:text-5xl font-bold text-teal-600">
                {result.homeScore}
              </div>
              <div className="text-2xl text-slate-400">-</div>
              <div className="text-4xl md:text-5xl font-bold text-teal-600">
                {result.awayScore}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-left">
              <h2 className={`text-2xl md:text-3xl font-bold ${fixture.awayTeamId === gameState.playerTeam.id ? 'text-teal-600' : 'text-slate-900'}`}>
                {awayTeamName}
              </h2>
            </div>
          </div>

          {/* Attendance */}
          {result.attendance && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-slate-600">
              Attendance: {result.attendance.toLocaleString()}
            </div>
          )}
        </div>

        {/* Weather & Man of Match */}
        {isPlayerMatch && (result.weather || result.manOfMatch) && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Weather */}
            {result.weather && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Match Conditions</h3>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{weatherEmoji[result.weather.condition]}</div>
                  <div>
                    <div className="font-semibold text-lg text-slate-900">{result.weather.description}</div>
                    <div className="text-sm text-slate-600">{result.weather.temperature}°C</div>
                  </div>
                </div>
              </div>
            )}

            {/* Man of Match */}
            {result.manOfMatch && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6 border-2 border-yellow-400">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  ⭐ Man of the Match
                </h3>
                <div className="font-bold text-2xl text-slate-900 mb-1">{result.manOfMatch.playerName}</div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-yellow-700">
                    Rating: {result.manOfMatch.rating.toFixed(1)}/10
                  </span>
                  <span className="text-slate-600">{result.manOfMatch.reason}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match Statistics */}
        {isPlayerMatch && result.stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Match Statistics</h3>
            <div className="space-y-4">
              {/* Possession */}
              <div>
                <div className="flex justify-between text-sm text-slate-700 mb-2">
                  <span className="font-medium">Possession</span>
                  <span className="font-semibold">{result.stats.possession.home}% - {result.stats.possession.away}%</span>
                </div>
                <div className="flex h-6 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-teal-500 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${result.stats.possession.home}%` }}>
                    {result.stats.possession.home > 15 ? `${result.stats.possession.home}%` : ''}
                  </div>
                  <div className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${result.stats.possession.away}%` }}>
                    {result.stats.possession.away > 15 ? `${result.stats.possession.away}%` : ''}
                  </div>
                </div>
              </div>

              {/* Shots */}
              <div>
                <div className="flex justify-between text-sm text-slate-700 mb-2">
                  <span className="font-medium">Shots</span>
                  <span className="font-semibold">{result.stats.shots.home} - {result.stats.shots.away}</span>
                </div>
                <div className="flex h-5 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-teal-400" style={{ width: `${(result.stats.shots.home / Math.max(result.stats.shots.home + result.stats.shots.away, 1)) * 100}%` }}></div>
                  <div className="bg-blue-400" style={{ width: `${(result.stats.shots.away / Math.max(result.stats.shots.home + result.stats.shots.away, 1)) * 100}%` }}></div>
                </div>
              </div>

              {/* Shots on Target */}
              <div>
                <div className="flex justify-between text-sm text-slate-700 mb-2">
                  <span className="font-medium">Shots on Target</span>
                  <span className="font-semibold">{result.stats.shotsOnTarget.home} - {result.stats.shotsOnTarget.away}</span>
                </div>
                <div className="flex h-5 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-teal-400" style={{ width: `${(result.stats.shotsOnTarget.home / Math.max(result.stats.shotsOnTarget.home + result.stats.shotsOnTarget.away, 1)) * 100}%` }}></div>
                  <div className="bg-blue-400" style={{ width: `${(result.stats.shotsOnTarget.away / Math.max(result.stats.shotsOnTarget.home + result.stats.shotsOnTarget.away, 1)) * 100}%` }}></div>
                </div>
              </div>

              {/* Corners */}
              <div>
                <div className="flex justify-between text-sm text-slate-700 mb-2">
                  <span className="font-medium">Corners</span>
                  <span className="font-semibold">{result.stats.corners.home} - {result.stats.corners.away}</span>
                </div>
                <div className="flex h-5 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-teal-400" style={{ width: `${(result.stats.corners.home / Math.max(result.stats.corners.home + result.stats.corners.away, 1)) * 100}%` }}></div>
                  <div className="bg-blue-400" style={{ width: `${(result.stats.corners.away / Math.max(result.stats.corners.home + result.stats.corners.away, 1)) * 100}%` }}></div>
                </div>
              </div>

              {/* Fouls */}
              <div>
                <div className="flex justify-between text-sm text-slate-700 mb-2">
                  <span className="font-medium">Fouls</span>
                  <span className="font-semibold">{result.stats.fouls.home} - {result.stats.fouls.away}</span>
                </div>
                <div className="flex h-5 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-orange-400" style={{ width: `${(result.stats.fouls.home / Math.max(result.stats.fouls.home + result.stats.fouls.away, 1)) * 100}%` }}></div>
                  <div className="bg-red-400" style={{ width: `${(result.stats.fouls.away / Math.max(result.stats.fouls.home + result.stats.fouls.away, 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Ratings */}
        {isPlayerMatch && result.playerRatings && result.playerRatings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Player Ratings</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setRatingsSortBy('rating')}
                  className={`px-3 py-1 text-sm rounded ${ratingsSortBy === 'rating' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-slate-700 hover:bg-gray-300'}`}
                >
                  By Rating
                </button>
                <button
                  onClick={() => setRatingsSortBy('name')}
                  className={`px-3 py-1 text-sm rounded ${ratingsSortBy === 'name' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-slate-700 hover:bg-gray-300'}`}
                >
                  By Name
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Home Team Ratings */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-3 pb-2 border-b-2 border-teal-300">{homeTeamName}</h4>
                <div className="space-y-2">
                  {result.playerRatings
                    .filter((r) => r.team === 'home')
                    .sort((a, b) => {
                      if (ratingsSortBy === 'rating') return b.rating - a.rating;
                      return a.playerName.localeCompare(b.playerName);
                    })
                    .map((rating, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{rating.playerName}</div>
                          <div className="text-xs text-slate-500">{rating.position}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {rating.goals && rating.goals > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ⚽ {rating.goals}
                            </span>
                          )}
                          {rating.assists && rating.assists > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              🎯 {rating.assists}
                            </span>
                          )}
                          <span className={`font-bold text-lg min-w-[40px] text-right ${
                            rating.rating >= 8 ? 'text-green-600' :
                            rating.rating >= 6.5 ? 'text-slate-700' :
                            'text-red-600'
                          }`}>
                            {rating.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Away Team Ratings */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-3 pb-2 border-b-2 border-blue-300">{awayTeamName}</h4>
                <div className="space-y-2">
                  {result.playerRatings
                    .filter((r) => r.team === 'away')
                    .sort((a, b) => {
                      if (ratingsSortBy === 'rating') return b.rating - a.rating;
                      return a.playerName.localeCompare(b.playerName);
                    })
                    .map((rating, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{rating.playerName}</div>
                          <div className="text-xs text-slate-500">{rating.position}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {rating.goals && rating.goals > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ⚽ {rating.goals}
                            </span>
                          )}
                          {rating.assists && rating.assists > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              🎯 {rating.assists}
                            </span>
                          )}
                          <span className={`font-bold text-lg min-w-[40px] text-right ${
                            rating.rating >= 8 ? 'text-green-600' :
                            rating.rating >= 6.5 ? 'text-slate-700' :
                            'text-red-600'
                          }`}>
                            {rating.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post-Match Reaction */}
        {isPlayerMatch && result.postMatchAnalysis && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              💬 Post-Match Reaction
            </h3>

            {/* Manager Quotes */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Home Manager Quote */}
              <div className={`rounded-lg p-4 border-2 ${
                result.postMatchAnalysis.homeManagerQuote.sentiment === 'happy'
                  ? 'bg-green-50 border-green-300'
                  : result.postMatchAnalysis.homeManagerQuote.sentiment === 'frustrated'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-2xl">
                    {result.postMatchAnalysis.homeManagerQuote.sentiment === 'happy' ? '😊' :
                     result.postMatchAnalysis.homeManagerQuote.sentiment === 'frustrated' ? '😤' : '😐'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {result.postMatchAnalysis.homeManagerQuote.managerName}
                    </div>
                    <div className="text-xs text-slate-600">{homeTeamName} Manager</div>
                  </div>
                </div>
                <p className="text-sm text-slate-700 italic">
                  "{result.postMatchAnalysis.homeManagerQuote.quote}"
                </p>
              </div>

              {/* Away Manager Quote */}
              <div className={`rounded-lg p-4 border-2 ${
                result.postMatchAnalysis.awayManagerQuote.sentiment === 'happy'
                  ? 'bg-green-50 border-green-300'
                  : result.postMatchAnalysis.awayManagerQuote.sentiment === 'frustrated'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-2xl">
                    {result.postMatchAnalysis.awayManagerQuote.sentiment === 'happy' ? '😊' :
                     result.postMatchAnalysis.awayManagerQuote.sentiment === 'frustrated' ? '😤' : '😐'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {result.postMatchAnalysis.awayManagerQuote.managerName}
                    </div>
                    <div className="text-xs text-slate-600">{awayTeamName} Manager</div>
                  </div>
                </div>
                <p className="text-sm text-slate-700 italic">
                  "{result.postMatchAnalysis.awayManagerQuote.quote}"
                </p>
              </div>
            </div>

            {/* Player Interview */}
            {result.postMatchAnalysis.playerInterview && (
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xl">🎙️</div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {result.postMatchAnalysis.playerInterview.playerName}
                    </div>
                    <div className="text-xs text-slate-600">
                      {result.postMatchAnalysis.playerInterview.teamName} - Rating: {result.postMatchAnalysis.playerInterview.rating.toFixed(1)}/10
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-700 italic">
                  "{result.postMatchAnalysis.playerInterview.quote}"
                </p>
              </div>
            )}

            {/* Turning Point */}
            {result.postMatchAnalysis.turningPoint && (
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500 mb-4">
                <div className="font-semibold text-purple-900 text-sm mb-1">⚡ Turning Point</div>
                <p className="text-sm text-slate-700">{result.postMatchAnalysis.turningPoint}</p>
              </div>
            )}

            {/* Key Stats */}
            {result.postMatchAnalysis.keyStats.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="font-semibold text-slate-900 text-sm mb-3">📊 Key Statistics</div>
                <ul className="space-y-2">
                  {result.postMatchAnalysis.keyStats.map((stat, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-teal-600 mt-0.5">▪</span>
                      <span>{stat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Match Events Timeline */}
        {sortedEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Match Events</h3>
            <div className="space-y-3">
              {sortedEvents.map((event, index) => {
                const eventTeamName = event.team === 'home' ? homeTeamName : awayTeamName;

                let eventIcon = '';
                let eventColor = '';
                let eventLabel = '';

                switch (event.type) {
                  case 'goal':
                    eventIcon = '⚽';
                    eventColor = 'text-green-600';
                    eventLabel = 'Goal';
                    break;
                  case 'own-goal':
                    eventIcon = '⚽';
                    eventColor = 'text-orange-600';
                    eventLabel = 'Own Goal';
                    break;
                  case 'penalty':
                    eventIcon = '⚽';
                    eventColor = 'text-blue-600';
                    eventLabel = 'Penalty';
                    break;
                  case 'yellow-card':
                    eventIcon = '🟨';
                    eventColor = 'text-yellow-600';
                    eventLabel = 'Yellow Card';
                    break;
                  case 'red-card':
                    eventIcon = '🟥';
                    eventColor = 'text-red-600';
                    eventLabel = 'Red Card';
                    break;
                }

                return (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-sm font-bold text-slate-600 min-w-[50px]">
                      {event.minute}'
                    </div>
                    <div className="text-2xl">{eventIcon}</div>
                    <div className="flex-1">
                      <div className={`font-semibold ${eventColor}`}>
                        {eventLabel} - {eventTeamName}
                      </div>
                      <div className="text-slate-900 font-medium">
                        {event.playerName}
                        {event.assistPlayerName && (
                          <span className="text-slate-600 font-normal">
                            {' '}(Assist: {event.assistPlayerName})
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <div className="text-sm text-slate-600 mt-1">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Goal Scorers */}
        {(result.homeGoalScorers && result.homeGoalScorers.length > 0) ||
         (result.awayGoalScorers && result.awayGoalScorers.length > 0) ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Goal Scorers</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Home Team Scorers */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">{homeTeamName}</h4>
                {result.homeGoalScorers && result.homeGoalScorers.length > 0 ? (
                  <ul className="space-y-1">
                    {result.homeGoalScorers.map((scorer, index) => (
                      <li key={index} className="text-slate-900">
                        ⚽ {scorer}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">No goals</p>
                )}
              </div>

              {/* Away Team Scorers */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">{awayTeamName}</h4>
                {result.awayGoalScorers && result.awayGoalScorers.length > 0 ? (
                  <ul className="space-y-1">
                    {result.awayGoalScorers.map((scorer, index) => (
                      <li key={index} className="text-slate-900">
                        ⚽ {scorer}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">No goals</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* No Events Message */}
        {sortedEvents.length === 0 && (!result.homeGoalScorers || result.homeGoalScorers.length === 0) &&
         (!result.awayGoalScorers || result.awayGoalScorers.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No detailed match events available
            </h3>
            <p className="text-slate-600">
              Basic match result recorded. Detailed events will be available for future matches.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
