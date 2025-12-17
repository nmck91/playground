/**
 * Football Director - Development Report Component
 * Displays player development at end of season
 */

'use client';

import { DevelopmentReport as Report } from '@playground/football-director-engine';

interface DevelopmentReportProps {
  reports: Report[];
  onClose: () => void;
}

export function DevelopmentReport({ reports, onClose }: DevelopmentReportProps) {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'developing':
        return 'text-green-600';
      case 'peak':
        return 'text-blue-600';
      case 'declining':
        return 'text-orange-600';
      case 'veteran':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'developing':
        return '📈 Developing';
      case 'peak':
        return '⭐ Peak';
      case 'declining':
        return '📉 Declining';
      case 'veteran':
        return '👴 Veteran';
      default:
        return phase;
    }
  };

  const getSkillChangeColor = (change: number) => {
    if (change > 0.5) return 'text-green-600 font-bold';
    if (change > 0) return 'text-green-600';
    if (change < -0.5) return 'text-red-600 font-bold';
    if (change < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const improved = reports.filter((r) => r.skillChange > 0.3).length;
  const declined = reports.filter((r) => r.skillChange < -0.3).length;
  const maintained = reports.length - improved - declined;

  const avgChange =
    reports.reduce((sum, r) => sum + r.skillChange, 0) / reports.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-50 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-purple-500 text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📊 Season Development Report</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-100 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Total Players</div>
                <div className="text-2xl font-bold text-slate-900">{reports.length}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Improved</div>
                <div className="text-2xl font-bold text-green-600">{improved}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Declined</div>
                <div className="text-2xl font-bold text-red-600">{declined}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Avg Change</div>
                <div className={`text-2xl font-bold ${getSkillChangeColor(avgChange)}`}>
                  {avgChange >= 0 ? '+' : ''}
                  {avgChange.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Player Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Player Development</h3>
            <div className="space-y-3">
              {reports
                .sort((a, b) => Math.abs(b.skillChange) - Math.abs(a.skillChange))
                .map((report) => (
                  <div
                    key={report.playerId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-normal"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">
                            {report.playerName}
                          </h4>
                          <span className={`text-sm font-medium ${getPhaseColor(report.phase)}`}>
                            {getPhaseLabel(report.phase)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Age:</span>
                            <span className="ml-2 font-medium text-slate-900">
                              {report.oldAge} → {report.newAge}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Skill:</span>
                            <span className="ml-2 font-medium text-slate-900">
                              {report.oldSkill.toFixed(1)} → {report.newSkill.toFixed(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Change:</span>
                            <span
                              className={`ml-2 font-bold ${getSkillChangeColor(report.skillChange)}`}
                            >
                              {report.skillChange >= 0 ? '+' : ''}
                              {report.skillChange.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual indicator */}
                      <div className="ml-4">
                        {report.skillChange > 0.5 && (
                          <div className="text-3xl">🔥</div>
                        )}
                        {report.skillChange > 0 && report.skillChange <= 0.5 && (
                          <div className="text-3xl">↗️</div>
                        )}
                        {Math.abs(report.skillChange) <= 0.3 && (
                          <div className="text-3xl">➡️</div>
                        )}
                        {report.skillChange < 0 && report.skillChange >= -0.5 && (
                          <div className="text-3xl">↘️</div>
                        )}
                        {report.skillChange < -0.5 && (
                          <div className="text-3xl">⚠️</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-normal"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
