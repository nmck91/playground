/**
 * Player Stats Modal Component
 * Full player statistics view with tabs for current season, career, and history
 */

'use client';

import { Player } from '@playground/football-director-engine';
import { Modal, Tabs, StatCard, Tab } from '../ui';
import { useState } from 'react';

export interface PlayerStatsModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerStatsModal({ player, isOpen, onClose }: PlayerStatsModalProps) {
  const [activeTab, setActiveTab] = useState('current');

  if (!player) return null;

  const { stats, history, position } = player;

  // Current Season Tab
  const currentSeasonContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Appearances" value={stats.appearances} icon="👕" />
        <StatCard label="Goals" value={stats.goals} icon="⚽" variant={stats.goals > 0 ? 'success' : 'default'} />
        <StatCard label="Assists" value={stats.assists} icon="🎯" variant={stats.assists > 0 ? 'primary' : 'default'} />

        {position === 'GK' && (
          <StatCard
            label="Clean Sheets"
            value={stats.cleanSheets}
            icon="🧤"
            variant={stats.cleanSheets > 0 ? 'success' : 'default'}
          />
        )}

        <StatCard
          label="Yellow Cards"
          value={stats.yellowCards}
          icon="🟨"
          variant={stats.yellowCards > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Red Cards"
          value={stats.redCards}
          icon="🟥"
          variant={stats.redCards > 0 ? 'warning' : 'default'}
        />
      </div>

      {stats.appearances === 0 && (
        <div className="text-center py-8 text-gray-500">
          No matches played this season yet.
        </div>
      )}

      {stats.appearances > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Season Averages</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Goals per game</p>
              <p className="font-semibold text-gray-900">
                {(stats.goals / stats.appearances).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Assists per game</p>
              <p className="font-semibold text-gray-900">
                {(stats.assists / stats.appearances).toFixed(2)}
              </p>
            </div>
            {position === 'GK' && (
              <div>
                <p className="text-gray-600">Clean sheet %</p>
                <p className="font-semibold text-gray-900">
                  {((stats.cleanSheets / stats.appearances) * 100).toFixed(0)}%
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Cards per game</p>
              <p className="font-semibold text-gray-900">
                {((stats.yellowCards + stats.redCards) / stats.appearances).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Career Stats Tab
  const careerStatsContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Career Appearances"
          value={stats.careerAppearances}
          icon="👕"
          variant="primary"
        />
        <StatCard
          label="Career Goals"
          value={stats.careerGoals}
          icon="⚽"
          variant="success"
        />
        <StatCard
          label="Career Assists"
          value={stats.careerAssists}
          icon="🎯"
          variant="primary"
        />
        {position === 'GK' && (
          <StatCard
            label="Career Clean Sheets"
            value={stats.careerCleanSheets}
            icon="🧤"
            variant="success"
          />
        )}
      </div>

      {stats.careerAppearances === 0 && (
        <div className="text-center py-8 text-gray-500">
          No career statistics yet. Player hasn't made their debut.
        </div>
      )}

      {stats.careerAppearances > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Career Averages</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Goals per game</p>
              <p className="font-semibold text-gray-900">
                {(stats.careerGoals / stats.careerAppearances).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Assists per game</p>
              <p className="font-semibold text-gray-900">
                {(stats.careerAssists / stats.careerAppearances).toFixed(2)}
              </p>
            </div>
            {position === 'GK' && (
              <div>
                <p className="text-gray-600">Clean sheet %</p>
                <p className="font-semibold text-gray-900">
                  {((stats.careerCleanSheets / stats.careerAppearances) * 100).toFixed(0)}%
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Goal contributions</p>
              <p className="font-semibold text-gray-900">
                {stats.careerGoals + stats.careerAssists}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Season History Tab
  const historyContent = (
    <div className="space-y-4">
      {history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No season history available yet.
        </div>
      )}

      {history.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apps
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assists
                </th>
                {position === 'GK' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clean Sheets
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history
                .slice()
                .reverse()
                .map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {record.season}/{record.season + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {record.teamName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {record.appearances}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {record.goals}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {record.assists}
                    </td>
                    {position === 'GK' && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.cleanSheets || 0}
                      </td>
                    )}
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
      id: 'current',
      label: 'Current Season',
      content: currentSeasonContent,
    },
    {
      id: 'career',
      label: 'Career Stats',
      content: careerStatsContent,
    },
    {
      id: 'history',
      label: 'Season History',
      content: historyContent,
      badge: history.length || undefined,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${player.name} - ${position}`}
      size="lg"
    >
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Age:</span> {player.age}
          </div>
          <div>
            <span className="font-medium">Skill:</span> {player.skill}/20
          </div>
          <div>
            <span className="font-medium">Wages:</span> £{player.wages.toLocaleString()}/wk
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </Modal>
  );
}
