'use client';

import { useGameStore, useSaveStore, useStaffStore } from '../../stores';
import { StaffManager } from '@playground/football-director-engine';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export default function StaffPage() {
  const gameState = useGameStore((state) => state.gameState);
  const loading = useSaveStore((state) => state.isLoading);
  const error = useSaveStore((state) => state.loadError);
  const hireStaff = useStaffStore((state) => state.hireStaff);
  const fireStaff = useStaffStore((state) => state.fireStaff);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-900 dark:text-dark-text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-slate-600 dark:text-dark-text-secondary">No active game. Start a new game first.</div>
      </div>
    );
  }

  const staffManager = new StaffManager();

  // Get current staff by role
  const manager = gameState.playerTeam.staff.find((s) => s.role === 'manager');
  const coaches = gameState.playerTeam.staff.filter((s) => s.role === 'coach');
  const scout = gameState.playerTeam.staff.find((s) => s.role === 'scout');

  // Get bonuses
  const managerBonus = staffManager.getManagerBonus(gameState.playerTeam);
  const coachBonus = staffManager.getCoachBonus(gameState.playerTeam);
  const scoutBonus = staffManager.getScoutBonus(gameState.playerTeam);

  // Get available staff by role
  const availableManagers = gameState.staffMarket.filter((s) => s.role === 'manager');
  const availableCoaches = gameState.staffMarket.filter((s) => s.role === 'coach');
  const availableScouts = gameState.staffMarket.filter((s) => s.role === 'scout');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'coach':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'scout':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return '👔';
      case 'coach':
        return '📋';
      case 'scout':
        return '🔍';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-900 dark:text-dark-text-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <span className="text-2xl">←</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">Staff</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Staff Effects Summary */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-4">
            Staff Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Manager Bonus</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                {managerBonus >= 1.0 ? '+' : ''}{((managerBonus - 1.0) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">Match Performance</div>
            </div>
            <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Coach Bonus</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                +{coachBonus.toFixed(1)} skill
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">Player Development</div>
            </div>
            <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">Scout Bonus</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                +{scoutBonus} players
              </div>
              <div className="text-xs text-green-700 dark:text-green-400 mt-1">Transfer Market Quality</div>
            </div>
          </div>
        </div>

        {/* Current Staff */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
            Your Staff ({gameState.playerTeam.staff.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameState.playerTeam.staff.map((staff) => {
              // Can fire if: (1) have multiple staff, OR (2) have replacement available in market
              const hasReplacement = gameState.staffMarket.some(s => s.role === staff.role);
              const canFire = gameState.playerTeam.staff.length > 1 || hasReplacement;

              return (
                <div
                  key={staff.id}
                  className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4 hover:shadow-md transition-normal bg-white dark:bg-dark-bg-tertiary"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                        {getRoleIcon(staff.role)} {staff.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-dark-text-secondary">{staff.specialty}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                        staff.role
                      )}`}
                    >
                      {staff.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-dark-text-secondary">Skill:</span>
                      <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                        {staff.skill}/20
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-dark-text-secondary">Salary:</span>
                      <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                        £{staff.salary.toLocaleString()}/wk
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => fireStaff(staff.id)}
                    disabled={!canFire}
                    className="w-full bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canFire ? 'Fire (2 weeks severance)' : 'No replacement available'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Staff - Managers */}
        {availableManagers.length > 0 && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
              Available Managers ({availableManagers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableManagers.map((staff) => {
                const canAfford = gameState.finances.budget >= staff.salary * 4;
                const hasManager = !!manager;
                const compatibility = staffManager.calculateStyleCompatibility(
                  staff.style,
                  gameState.playerTeam.philosophy
                );

                const getCompatibilityColor = (score: number) => {
                  if (score >= 90) return 'text-green-600 dark:text-green-400';
                  if (score >= 70) return 'text-teal-600 dark:text-teal-400';
                  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
                  return 'text-red-600 dark:text-red-400';
                };

                return (
                  <div
                    key={staff.id}
                    className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4 hover:shadow-md transition-normal bg-white dark:bg-dark-bg-tertiary"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                          {getRoleIcon(staff.role)} {staff.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">{staff.specialty}</p>
                        {staff.style && (
                          <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1 capitalize">
                            Style: {staff.style}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                          staff.role
                        )}`}
                      >
                        MANAGER
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                          {staff.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Salary:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{staff.salary.toLocaleString()}/wk
                        </span>
                      </div>
                    </div>

                    {gameState.playerTeam.philosophy && (
                      <div className="bg-gray-50 dark:bg-dark-bg-primary rounded p-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-dark-text-secondary">Club Match:</span>
                          <span className={`font-bold text-base ${getCompatibilityColor(compatibility)}`}>
                            {compatibility}%
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => hireStaff(staff)}
                      disabled={!canAfford || hasManager}
                      className="w-full bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasManager
                        ? 'Already Have Manager'
                        : !canAfford
                        ? 'Cannot Afford'
                        : 'Hire'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Staff - Coaches */}
        {availableCoaches.length > 0 && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
              Available Coaches ({availableCoaches.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCoaches.map((staff) => {
                const canAfford = gameState.finances.budget >= staff.salary * 4;
                const hasMaxCoaches = coaches.length >= 3;

                return (
                  <div
                    key={staff.id}
                    className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4 hover:shadow-md transition-normal bg-white dark:bg-dark-bg-tertiary"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                          {getRoleIcon(staff.role)} {staff.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">{staff.specialty}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                          staff.role
                        )}`}
                      >
                        COACH
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                          {staff.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Salary:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{staff.salary.toLocaleString()}/wk
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => hireStaff(staff)}
                      disabled={!canAfford || hasMaxCoaches}
                      className="w-full bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasMaxCoaches
                        ? 'Max Coaches (3)'
                        : !canAfford
                        ? 'Cannot Afford'
                        : 'Hire'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Staff - Scouts */}
        {availableScouts.length > 0 && (
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
              Available Scouts ({availableScouts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableScouts.map((staff) => {
                const canAfford = gameState.finances.budget >= staff.salary * 4;
                const hasScout = !!scout;

                return (
                  <div
                    key={staff.id}
                    className="border border-gray-200 dark:border-dark-border-primary rounded-lg p-4 hover:shadow-md transition-normal bg-white dark:bg-dark-bg-tertiary"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                          {getRoleIcon(staff.role)} {staff.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">{staff.specialty}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                          staff.role
                        )}`}
                      >
                        SCOUT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                          {staff.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Salary:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{staff.salary.toLocaleString()}/wk
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => hireStaff(staff)}
                      disabled={!canAfford || hasScout}
                      className="w-full bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasScout
                        ? 'Already Have Scout'
                        : !canAfford
                        ? 'Cannot Afford'
                        : 'Hire'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
