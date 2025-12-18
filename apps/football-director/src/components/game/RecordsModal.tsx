/**
 * Records Modal Component
 * Shows club records (all-time) and season history
 */

'use client';

import { useState } from 'react';
import { ClubRecords, SeasonRecords } from '@playground/football-director-engine';
import { Modal, Tabs, Tab } from '../ui';

export interface RecordsModalProps {
  clubRecords: ClubRecords;
  seasonRecords: SeasonRecords[];
  currentSeason: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RecordsModal({
  clubRecords,
  seasonRecords,
  currentSeason,
  isOpen,
  onClose,
}: RecordsModalProps) {
  const [activeTab, setActiveTab] = useState('club');

  const getPositionColor = (position: number) => {
    if (position === 1) return 'text-yellow-600 font-bold';
    if (position <= 4) return 'text-green-600 font-semibold';
    if (position >= 18) return 'text-red-600';
    return 'text-gray-900';
  };

  const getOrdinal = (num: number) => {
    if (num >= 11 && num <= 13) return `${num}th`;
    const lastDigit = num % 10;
    switch (lastDigit) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  };

  // Club Records Tab
  const clubRecordsContent = (
    <div className="space-y-6">
      {/* League Performance */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          🏆 League Performance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Best League Position</div>
            <div className={`text-2xl font-bold ${getPositionColor(clubRecords.bestLeaguePosition.position)}`}>
              {getOrdinal(clubRecords.bestLeaguePosition.position)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.bestLeaguePosition.season}/{clubRecords.bestLeaguePosition.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Most Points</div>
            <div className="text-2xl font-bold text-teal-600">
              {clubRecords.mostPoints.points}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.mostPoints.season}/{clubRecords.mostPoints.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Most Wins</div>
            <div className="text-2xl font-bold text-green-600">
              {clubRecords.mostWins.wins}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.mostWins.season}/{clubRecords.mostWins.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Best Goal Difference</div>
            <div className="text-2xl font-bold text-blue-600">
              {clubRecords.bestGoalDifference.difference > 0 ? '+' : ''}{clubRecords.bestGoalDifference.difference}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.bestGoalDifference.season}/{clubRecords.bestGoalDifference.season + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Defense */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          ⚽ Goals & Defense
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Most Goals Scored</div>
            <div className="text-2xl font-bold text-green-600">
              {clubRecords.mostGoalsScored.goals}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.mostGoalsScored.season}/{clubRecords.mostGoalsScored.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Fewest Goals Conceded</div>
            <div className="text-2xl font-bold text-teal-600">
              {clubRecords.fewestGoalsConceded.goals}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.fewestGoalsConceded.season}/{clubRecords.fewestGoalsConceded.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Most Clean Sheets</div>
            <div className="text-2xl font-bold text-blue-600">
              {clubRecords.mostCleanSheetsSeason.cleanSheets}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.mostCleanSheetsSeason.season}/{clubRecords.mostCleanSheetsSeason.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Biggest Win</div>
            <div className="text-2xl font-bold text-green-600">
              {clubRecords.biggestWin.score}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              vs {clubRecords.biggestWin.opponent} ({clubRecords.biggestWin.homeOrAway})
            </div>
            <div className="text-xs text-gray-500">
              Season {clubRecords.biggestWin.season}/{clubRecords.biggestWin.season + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          🔥 Streaks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Longest Win Streak</div>
            <div className="text-2xl font-bold text-green-600">
              {clubRecords.longestWinStreak.streak} games
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.longestWinStreak.season}/{clubRecords.longestWinStreak.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Longest Unbeaten Streak</div>
            <div className="text-2xl font-bold text-teal-600">
              {clubRecords.longestUnbeatenStreak.streak} games
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.longestUnbeatenStreak.season}/{clubRecords.longestUnbeatenStreak.season + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Player Records */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
          👤 Player Records
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Most Goals (Single Season)</div>
            <div className="text-lg font-bold text-gray-900">
              {clubRecords.mostGoalsSingleSeason.playerName || 'None'}
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {clubRecords.mostGoalsSingleSeason.goals} goals
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.mostGoalsSingleSeason.season}/{clubRecords.mostGoalsSingleSeason.season + 1}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Most Assists (Single Season)</div>
            <div className="text-lg font-bold text-gray-900">
              {clubRecords.mostAssistsSingleSeason.playerName || 'None'}
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {clubRecords.mostAssistsSingleSeason.assists} assists
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Season {clubRecords.mostAssistsSingleSeason.season}/{clubRecords.mostAssistsSingleSeason.season + 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Season History Tab
  const seasonHistoryContent = (
    <div className="space-y-4">
      {seasonRecords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No season history available yet. Complete a season to see records!
        </div>
      )}

      {seasonRecords.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pts
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  W-D-L
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GF-GA
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GD
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Scorer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seasonRecords
                .slice()
                .reverse()
                .map((record) => (
                  <tr
                    key={record.season}
                    className={`hover:bg-gray-50 ${record.season === currentSeason ? 'bg-teal-50' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.season}/{record.season + 1}
                      {record.season === currentSeason && (
                        <span className="ml-2 text-xs text-teal-600 font-semibold">(Current)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`text-sm font-semibold ${getPositionColor(record.finalPosition)}`}>
                        {getOrdinal(record.finalPosition)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                      {record.points}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
                      {record.won}-{record.drawn}-{record.lost}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600">
                      {record.goalsFor}-{record.goalsAgainst}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={record.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {record.goalDifference > 0 ? '+' : ''}{record.goalDifference}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {record.topScorer ? (
                        <div>
                          <div className="font-medium">{record.topScorer.playerName}</div>
                          <div className="text-xs text-gray-500">{record.topScorer.goals} goals</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const tabs: Tab[] = [
    {
      id: 'club',
      label: 'Club Records',
      content: clubRecordsContent,
    },
    {
      id: 'history',
      label: 'Season History',
      content: seasonHistoryContent,
      badge: seasonRecords.length || undefined,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Records & History" size="xl">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </Modal>
  );
}
