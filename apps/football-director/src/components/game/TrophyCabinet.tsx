/**
 * Football Director - Trophy Cabinet Component
 * Displays achievements and season awards
 */

'use client';

import { Achievement, AchievementCategory, SeasonAward } from '@playground/football-director-engine';
import { useState } from 'react';
import { Modal } from '../ui/Modal';

interface TrophyCabinetProps {
  achievements: Achievement[];
  seasonAwards: SeasonAward[];
  isOpen: boolean;
  onClose: () => void;
}

export function TrophyCabinet({ achievements, seasonAwards, isOpen, onClose }: TrophyCabinetProps) {
  const [activeTab, setActiveTab] = useState<'achievements' | 'awards'>('achievements');
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');

  const categories: { value: AchievementCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'league', label: 'League' },
    { value: 'goals', label: 'Goals' },
    { value: 'defense', label: 'Defense' },
    { value: 'finance', label: 'Finance' },
    { value: 'players', label: 'Players' },
    { value: 'special', label: 'Special' },
  ];

  const filteredAchievements = achievements.filter(
    (a) => categoryFilter === 'all' || a.category === categoryFilter
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏆 Trophy Cabinet">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-300">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-900 mb-1">
              {unlockedCount} / {totalCount}
            </div>
            <div className="text-sm text-amber-700">Achievements Unlocked</div>
            <div className="mt-2 bg-white rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'achievements'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('awards')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'awards'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Season Awards
            </button>
          </nav>
        </div>

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-normal ${
                    categoryFilter === cat.value
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-lg p-4 border-2 transition-normal ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold ${
                            achievement.unlocked ? 'text-amber-900' : 'text-slate-600'
                          }`}
                        >
                          {achievement.name}
                        </h3>
                        {achievement.unlocked && (
                          <span className="text-green-600 text-sm font-medium">✓ Unlocked</span>
                        )}
                      </div>
                      <p
                        className={`text-sm mb-2 ${
                          achievement.unlocked ? 'text-amber-800' : 'text-slate-500'
                        }`}
                      >
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      {achievement.target && !achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.progress || 0} / {achievement.target}
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-teal-500 h-full transition-all"
                              style={{
                                width: `${((achievement.progress || 0) / achievement.target) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Unlock Date */}
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-amber-700 mt-2">
                          Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No achievements in this category
              </div>
            )}
          </div>
        )}

        {/* Season Awards Tab */}
        {activeTab === 'awards' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {seasonAwards.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-3">🏅</div>
                <p>No season awards yet</p>
                <p className="text-sm mt-2">Complete your first season to earn awards!</p>
              </div>
            )}

            {seasonAwards
              .slice()
              .reverse()
              .map((seasonAward) => (
                <div
                  key={seasonAward.season}
                  className="bg-white rounded-lg p-6 border-2 border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <span className="text-2xl">📅</span>
                    <h3 className="text-xl font-bold text-slate-900">Season {seasonAward.season}</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Golden Boot */}
                    {seasonAward.awards.goldenBoot && (
                      <div className="flex items-start gap-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <span className="text-2xl">⚽</span>
                        <div>
                          <div className="font-semibold text-yellow-900">Golden Boot</div>
                          <div className="text-sm text-yellow-800">
                            {seasonAward.awards.goldenBoot.playerName}
                          </div>
                          <div className="text-xs text-yellow-700">
                            {seasonAward.awards.goldenBoot.goals} goals
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Golden Glove */}
                    {seasonAward.awards.goldenGlove && (
                      <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <span className="text-2xl">🧤</span>
                        <div>
                          <div className="font-semibold text-blue-900">Golden Glove</div>
                          <div className="text-sm text-blue-800">
                            {seasonAward.awards.goldenGlove.playerName}
                          </div>
                          <div className="text-xs text-blue-700">
                            {seasonAward.awards.goldenGlove.cleanSheets} clean sheets
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Player of the Year */}
                    {seasonAward.awards.playerOfYear && (
                      <div className="flex items-start gap-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <span className="text-2xl">⭐</span>
                        <div>
                          <div className="font-semibold text-purple-900">Player of the Year</div>
                          <div className="text-sm text-purple-800">
                            {seasonAward.awards.playerOfYear.playerName}
                          </div>
                          <div className="text-xs text-purple-700">
                            {seasonAward.awards.playerOfYear.reason}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Young Player of the Year */}
                    {seasonAward.awards.youngPlayerOfYear && (
                      <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3 border border-green-200">
                        <span className="text-2xl">🌟</span>
                        <div>
                          <div className="font-semibold text-green-900">Young Player of the Year</div>
                          <div className="text-sm text-green-800">
                            {seasonAward.awards.youngPlayerOfYear.playerName} (Age{' '}
                            {seasonAward.awards.youngPlayerOfYear.age})
                          </div>
                          <div className="text-xs text-green-700">
                            {seasonAward.awards.youngPlayerOfYear.reason}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Awards */}
                    {!seasonAward.awards.goldenBoot &&
                      !seasonAward.awards.goldenGlove &&
                      !seasonAward.awards.playerOfYear &&
                      !seasonAward.awards.youngPlayerOfYear && (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          No awards earned this season
                        </div>
                      )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
