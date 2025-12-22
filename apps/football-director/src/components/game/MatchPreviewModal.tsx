'use client';

import { MatchPreview } from '@playground/football-director-engine';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export interface MatchPreviewModalProps {
  preview: MatchPreview | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchPreviewModal({ preview, isOpen, onClose }: MatchPreviewModalProps) {
  if (!preview) return null;

  // Weather emoji mapping
  const weatherEmoji: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    foggy: '🌫️',
    snowy: '❄️',
  };

  // Form badge color mapping
  const formColor = (result: 'W' | 'D' | 'L') => {
    if (result === 'W') return 'bg-green-500 text-white';
    if (result === 'D') return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Match Preview - Week ${preview.week}`}
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-lg"
          >
            Close
          </button>
        </div>
      }
    >
      {/* Main Match Info */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h3 className="text-2xl font-bold mb-1">{preview.homeTeam}</h3>
            <div className="text-teal-100 text-sm">
              {preview.homePosition === 1
                ? '1st'
                : preview.homePosition === 2
                ? '2nd'
                : preview.homePosition === 3
                ? '3rd'
                : `${preview.homePosition}th`}{' '}
              in league
            </div>
          </div>
          <div className="text-4xl font-bold px-8">VS</div>
          <div className="flex-1 text-center">
            <h3 className="text-2xl font-bold mb-1">{preview.awayTeam}</h3>
            <div className="text-teal-100 text-sm">
              {preview.awayPosition === 1
                ? '1st'
                : preview.awayPosition === 2
                ? '2nd'
                : preview.awayPosition === 3
                ? '3rd'
                : `${preview.awayPosition}th`}{' '}
              in league
            </div>
          </div>
        </div>

        {/* Match Importance & Derby Badge */}
        <div className="mt-4 flex gap-2 justify-center">
          {preview.isDerby && (
            <Badge variant="danger" size="lg">
              🔥 DERBY
            </Badge>
          )}
          {preview.matchImportance === 'high' && !preview.isDerby && (
            <Badge variant="warning" size="lg">
              ⚡ KEY MATCH
            </Badge>
          )}
        </div>
      </div>

      {/* Weather & Attendance */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Weather Forecast</div>
          <div className="font-semibold text-lg">
            {weatherEmoji[preview.weather.condition]} {preview.weather.description}
          </div>
          <div className="text-sm text-slate-600 mt-1">{preview.weather.temperature}°C</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-slate-600 mb-1">Expected Attendance</div>
          <div className="font-semibold text-lg">
            {preview.expectedAttendance.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600 mt-1">Capacity crowd expected</div>
        </div>
      </div>

      {/* Head-to-Head */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-lg mb-3">Head-to-Head Record</h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{preview.headToHead.homeWins}</div>
            <div className="text-xs text-slate-600">{preview.homeTeam} Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">{preview.headToHead.draws}</div>
            <div className="text-xs text-slate-600">Draws</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{preview.headToHead.awayWins}</div>
            <div className="text-xs text-slate-600">{preview.awayTeam} Wins</div>
          </div>
        </div>

        {preview.headToHead.lastFiveMeetings.length > 0 && (
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Last 5 Meetings</div>
            <div className="space-y-2">
              {preview.headToHead.lastFiveMeetings.map((meeting, index) => (
                <div
                  key={index}
                  className="text-sm bg-white p-2 rounded border border-slate-200 flex justify-between"
                >
                  <span>
                    {meeting.homeTeam} vs {meeting.awayTeam}
                  </span>
                  <span className="font-semibold">
                    {meeting.homeScore} - {meeting.awayScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Team News Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Home Team News */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">{preview.homeTeam} Team News</h4>

          {/* Recent Form */}
          <div className="mb-3">
            <div className="text-xs text-slate-600 mb-1">Recent Form</div>
            <div className="flex gap-1">
              {preview.homeTeamNews.recentForm.map((result, index) => (
                <span
                  key={index}
                  className={`text-xs font-bold px-2 py-1 rounded ${formColor(result)}`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>

          {/* Key Players */}
          {preview.homeTeamNews.keyPlayers.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-slate-600 mb-1">Key Players</div>
              <div className="space-y-1">
                {preview.homeTeamNews.keyPlayers.map((player, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{player.playerName}</span>
                    <span className="text-slate-600 ml-2">
                      ({player.goals} {player.goals === 1 ? 'goal' : 'goals'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Injuries */}
          {preview.homeTeamNews.injuries.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-slate-600 mb-1">🚑 Injuries</div>
              <div className="space-y-1">
                {preview.homeTeamNews.injuries.map((injury, index) => (
                  <div key={index} className="text-xs text-red-600">
                    {injury.playerName} (back week {injury.returnWeek})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspensions */}
          {preview.homeTeamNews.suspensions.length > 0 && (
            <div>
              <div className="text-xs text-slate-600 mb-1">🟥 Suspended</div>
              <div className="space-y-1">
                {preview.homeTeamNews.suspensions.map((suspension, index) => (
                  <div key={index} className="text-xs text-orange-600">
                    {suspension.playerName} (back week {suspension.returnWeek})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Away Team News */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">{preview.awayTeam} Team News</h4>

          {/* Recent Form */}
          <div className="mb-3">
            <div className="text-xs text-slate-600 mb-1">Recent Form</div>
            <div className="flex gap-1">
              {preview.awayTeamNews.recentForm.map((result, index) => (
                <span
                  key={index}
                  className={`text-xs font-bold px-2 py-1 rounded ${formColor(result)}`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>

          {/* Key Players */}
          {preview.awayTeamNews.keyPlayers.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-slate-600 mb-1">Key Players</div>
              <div className="space-y-1">
                {preview.awayTeamNews.keyPlayers.map((player, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{player.playerName}</span>
                    <span className="text-slate-600 ml-2">
                      ({player.goals} {player.goals === 1 ? 'goal' : 'goals'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Injuries */}
          {preview.awayTeamNews.injuries.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-slate-600 mb-1">🚑 Injuries</div>
              <div className="space-y-1">
                {preview.awayTeamNews.injuries.map((injury, index) => (
                  <div key={index} className="text-xs text-red-600">
                    {injury.playerName} (back week {injury.returnWeek})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspensions */}
          {preview.awayTeamNews.suspensions.length > 0 && (
            <div>
              <div className="text-xs text-slate-600 mb-1">🟥 Suspended</div>
              <div className="space-y-1">
                {preview.awayTeamNews.suspensions.map((suspension, index) => (
                  <div key={index} className="text-xs text-orange-600">
                    {suspension.playerName} (back week {suspension.returnWeek})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manager Quotes */}
      {preview.managerQuotes && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="text-xs text-slate-600 mb-2">💬 {preview.homeTeam} Manager</div>
            <p className="text-sm italic text-slate-700">"{preview.managerQuotes.home}"</p>
          </div>
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
            <div className="text-xs text-slate-600 mb-2">💬 {preview.awayTeam} Manager</div>
            <p className="text-sm italic text-slate-700">"{preview.managerQuotes.away}"</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
