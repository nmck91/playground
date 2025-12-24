/**
 * Top Performers Widget Component
 * Dashboard widget showing season's top performers
 */

'use client';

import { SeasonTopPerformers, Player } from '@playground/football-director-engine';

export interface TopPerformersWidgetProps {
  topPerformers: SeasonTopPerformers;
  onPlayerClick?: (player: Player) => void;
}

export function TopPerformersWidget({ topPerformers, onPlayerClick }: TopPerformersWidgetProps) {
  const { topScorer, topAssists, mostAppearances, cleanSheetKing } = topPerformers;

  // Check if any competitive matches have been played
  const hasData = topScorer || topAssists || mostAppearances || cleanSheetKing;

  const performerData = [
    {
      title: 'Top Scorer',
      icon: '⚽',
      player: topScorer?.player,
      stat: topScorer?.goals,
      statLabel: topScorer?.goals === 1 ? 'goal' : 'goals',
    },
    {
      title: 'Top Assists',
      icon: '🎯',
      player: topAssists?.player,
      stat: topAssists?.assists,
      statLabel: topAssists?.assists === 1 ? 'assist' : 'assists',
    },
    {
      title: 'Most Appearances',
      icon: '👕',
      player: mostAppearances?.player,
      stat: mostAppearances?.appearances,
      statLabel: mostAppearances?.appearances === 1 ? 'game' : 'games',
    },
    {
      title: 'Clean Sheet King',
      icon: '🧤',
      player: cleanSheetKing?.player,
      stat: cleanSheetKing?.cleanSheets,
      statLabel: cleanSheetKing?.cleanSheets === 1 ? 'clean sheet' : 'clean sheets',
    },
  ];

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg border border-gray-200 dark:border-dark-border-primary p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
        🏆 Top Performers
      </h3>

      {hasData ? (
        <div className="space-y-4">
          {performerData.map((item) => (
            <div key={item.title}>
              {item.player ? (
                <button
                  onClick={() => item.player && onPlayerClick?.(item.player)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors border border-gray-100 dark:border-dark-border-secondary"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium uppercase tracking-wide">
                          {item.title}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                          {item.player.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-dark-text-secondary">
                          {item.player.position} · Skill {item.player.skill}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{item.stat}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary">{item.statLabel}</p>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-100 dark:border-dark-border-secondary">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl opacity-50">{item.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium uppercase tracking-wide">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-dark-text-tertiary italic">No data yet</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">⚽</div>
          <p className="text-base font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
            No Stats Yet
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
            Play competitive matches to see your top performers
          </p>
        </div>
      )}
    </div>
  );
}
