/**
 * Football Director - Match Highlights Component
 * Displays match results with goal scorers, events, and attendance
 */

'use client';

import { MatchResult } from '@playground/football-director-engine';
import { useState } from 'react';

interface MatchHighlightsProps {
  results: MatchResult[];
  playerTeamName: string;
  onClose: () => void;
}

export function MatchHighlights({ results, playerTeamName, onClose }: MatchHighlightsProps) {
  const [showRatings, setShowRatings] = useState(false);

  // Find player's match
  const playerMatch = results.find(
    (r) => r.homeTeam === playerTeamName || r.awayTeam === playerTeamName
  );

  // Other matches
  const otherMatches = results.filter(
    (r) => r.homeTeam !== playerTeamName && r.awayTeam !== playerTeamName
  );

  // Weather emoji mapping
  const weatherEmoji: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    foggy: '🌫️',
    snowy: '❄️',
  };

  const renderMatch = (match: MatchResult, isPlayerMatch: boolean) => {
    const { homeTeam, awayTeam, homeScore, awayScore, homeGoalScorers = [], awayGoalScorers = [], events = [], attendance, weather, stats, manOfMatch, playerRatings, isDerby } = match;

    return (
      <div
        key={`${homeTeam}-${awayTeam}`}
        className={`rounded-lg p-6 mb-4 ${
          isPlayerMatch ? 'bg-teal-50 border-2 border-teal-500' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Derby Badge */}
        {isDerby && (
          <div className="mb-3">
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              🔥 DERBY MATCH
            </span>
          </div>
        )}

        {/* Match Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="text-lg font-semibold text-slate-900">{homeTeam}</div>
            {homeGoalScorers.length > 0 && (
              <div className="text-sm text-slate-600 mt-1">
                {homeGoalScorers.map((scorer, i) => (
                  <span key={i} className="mr-2">
                    ⚽ {scorer}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="px-6">
            <div className="text-3xl font-bold text-teal-600">
              {homeScore} - {awayScore}
            </div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-lg font-semibold text-slate-900">{awayTeam}</div>
            {awayGoalScorers.length > 0 && (
              <div className="text-sm text-slate-600 mt-1">
                {awayGoalScorers.map((scorer, i) => (
                  <span key={i} className="ml-2">
                    {scorer} ⚽
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weather & Man of Match Row */}
        {(weather || manOfMatch) && isPlayerMatch && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Weather */}
            {weather && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xs text-slate-600 mb-1">Weather</div>
                <div className="font-semibold text-sm">
                  {weatherEmoji[weather.condition]} {weather.description}
                </div>
                <div className="text-xs text-slate-600 mt-1">{weather.temperature}°C</div>
              </div>
            )}

            {/* Man of Match */}
            {manOfMatch && (
              <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-400">
                <div className="text-xs text-yellow-700 font-semibold mb-1">⭐ MAN OF THE MATCH</div>
                <div className="font-bold text-sm text-slate-900">{manOfMatch.playerName}</div>
                <div className="text-xs text-slate-600 mt-1">
                  Rating: {manOfMatch.rating.toFixed(1)} - {manOfMatch.reason}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match Statistics */}
        {stats && isPlayerMatch && (
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Match Statistics</h4>
            <div className="space-y-3">
              {/* Possession */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Possession</span>
                  <span>{stats.possession.home}% - {stats.possession.away}%</span>
                </div>
                <div className="flex h-4 bg-gray-200 rounded overflow-hidden">
                  <div className="bg-teal-500" style={{ width: `${stats.possession.home}%` }}></div>
                  <div className="bg-blue-500" style={{ width: `${stats.possession.away}%` }}></div>
                </div>
              </div>

              {/* Shots */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Shots</span>
                  <span>{stats.shots.home} - {stats.shots.away}</span>
                </div>
                <div className="flex h-3 bg-gray-200 rounded overflow-hidden">
                  <div className="bg-teal-400" style={{ width: `${(stats.shots.home / (stats.shots.home + stats.shots.away)) * 100}%` }}></div>
                  <div className="bg-blue-400" style={{ width: `${(stats.shots.away / (stats.shots.home + stats.shots.away)) * 100}%` }}></div>
                </div>
              </div>

              {/* Shots on Target */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Shots on Target</span>
                  <span>{stats.shotsOnTarget.home} - {stats.shotsOnTarget.away}</span>
                </div>
                <div className="flex h-3 bg-gray-200 rounded overflow-hidden">
                  <div className="bg-teal-400" style={{ width: `${(stats.shotsOnTarget.home / (stats.shotsOnTarget.home + stats.shotsOnTarget.away)) * 100}%` }}></div>
                  <div className="bg-blue-400" style={{ width: `${(stats.shotsOnTarget.away / (stats.shotsOnTarget.home + stats.shotsOnTarget.away)) * 100}%` }}></div>
                </div>
              </div>

              {/* Corners */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Corners</span>
                  <span>{stats.corners.home} - {stats.corners.away}</span>
                </div>
                <div className="flex h-3 bg-gray-200 rounded overflow-hidden">
                  <div className="bg-teal-400" style={{ width: `${(stats.corners.home / Math.max(stats.corners.home + stats.corners.away, 1)) * 100}%` }}></div>
                  <div className="bg-blue-400" style={{ width: `${(stats.corners.away / Math.max(stats.corners.home + stats.corners.away, 1)) * 100}%` }}></div>
                </div>
              </div>

              {/* Fouls */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Fouls</span>
                  <span>{stats.fouls.home} - {stats.fouls.away}</span>
                </div>
                <div className="flex h-3 bg-gray-200 rounded overflow-hidden">
                  <div className="bg-orange-400" style={{ width: `${(stats.fouls.home / Math.max(stats.fouls.home + stats.fouls.away, 1)) * 100}%` }}></div>
                  <div className="bg-red-400" style={{ width: `${(stats.fouls.away / Math.max(stats.fouls.home + stats.fouls.away, 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Ratings */}
        {playerRatings && playerRatings.length > 0 && isPlayerMatch && (
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">Player Ratings</h4>
              <button
                onClick={() => setShowRatings(!showRatings)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                {showRatings ? '▲ Hide' : '▼ Show'}
              </button>
            </div>

            {showRatings && (
              <div className="grid grid-cols-2 gap-3">
                {/* Home Team Ratings */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">{homeTeam}</div>
                  <div className="space-y-1">
                    {playerRatings
                      .filter((r) => r.team === 'home')
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((rating, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 truncate">{rating.playerName}</span>
                          <span className={`font-bold ml-2 ${rating.rating >= 8 ? 'text-green-600' : rating.rating >= 6.5 ? 'text-slate-700' : 'text-red-600'}`}>
                            {rating.rating.toFixed(1)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Away Team Ratings */}
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">{awayTeam}</div>
                  <div className="space-y-1">
                    {playerRatings
                      .filter((r) => r.team === 'away')
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((rating, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 truncate">{rating.playerName}</span>
                          <span className={`font-bold ml-2 ${rating.rating >= 8 ? 'text-green-600' : rating.rating >= 6.5 ? 'text-slate-700' : 'text-red-600'}`}>
                            {rating.rating.toFixed(1)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match Events */}
        {events.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Match Events</h4>
            <div className="space-y-2">
              {events.map((event, i) => (
                <div key={i} className="flex items-start text-sm">
                  <span className="font-medium text-slate-500 w-12">{event.minute}'</span>
                  <div className="flex-1">
                    {event.type === 'goal' && <span className="text-green-600">⚽ GOAL</span>}
                    {event.type === 'yellow-card' && <span className="text-yellow-600">🟨 YELLOW CARD</span>}
                    {event.type === 'red-card' && <span className="text-red-600">🟥 RED CARD</span>}
                    <span className="ml-2 text-slate-700">{event.playerName}</span>
                    {event.description && (
                      <div className="text-slate-600 mt-1 ml-6">{event.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance */}
        {attendance && (
          <div className="border-t border-gray-200 pt-3 mt-4">
            <div className="text-sm text-slate-600">
              👥 Attendance: <span className="font-medium">{attendance.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-50 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-teal-500 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">⚽ Match Highlights</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-100 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Player's Match */}
          {playerMatch && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Your Match</h3>
              {renderMatch(playerMatch, true)}
            </div>
          )}

          {/* Other Matches */}
          {otherMatches.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Other Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherMatches.map((match) => (
                  <div key={`${match.homeTeam}-${match.awayTeam}`} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-slate-900">{match.homeTeam}</div>
                      <div className="text-lg font-bold text-teal-600">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="text-sm font-medium text-slate-900">{match.awayTeam}</div>
                    </div>
                    {(match.homeGoalScorers && match.homeGoalScorers.length > 0) || (match.awayGoalScorers && match.awayGoalScorers.length > 0) ? (
                      <div className="text-xs text-slate-600 mt-2">
                        {match.homeGoalScorers && match.homeGoalScorers.length > 0 && (
                          <div>⚽ {match.homeGoalScorers.join(', ')}</div>
                        )}
                        {match.awayGoalScorers && match.awayGoalScorers.length > 0 && (
                          <div>⚽ {match.awayGoalScorers.join(', ')}</div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-normal"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
