'use client';

import { useGameState } from '../../hooks/useGameState';
import { StaffManager } from '@playground/football-director-engine';
import Link from 'next/link';

export default function StaffPage() {
  const { gameState, loading, error, actions } = useGameState();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-slate-900 text-xl">Loading...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-slate-600">No active game. Start a new game first.</div>
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
        return 'bg-purple-100 text-purple-700';
      case 'coach':
        return 'bg-blue-100 text-blue-700';
      case 'scout':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-teal-500 text-cream-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">⚽ Staff Management</h1>
              <p className="text-teal-100 mt-2">
                Budget: £{gameState.finances.budget.toLocaleString()}
              </p>
            </div>
            <Link
              href="/"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-cream-100 transition-normal"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Staff Effects Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Staff Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="text-sm text-purple-600 mb-1">Manager Bonus</div>
              <div className="text-2xl font-bold text-purple-900">
                {managerBonus >= 1.0 ? '+' : ''}{((managerBonus - 1.0) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-purple-700 mt-1">Match Performance</div>
            </div>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-sm text-blue-600 mb-1">Coach Bonus</div>
              <div className="text-2xl font-bold text-blue-900">
                +{coachBonus.toFixed(1)} skill
              </div>
              <div className="text-xs text-blue-700 mt-1">Player Development</div>
            </div>
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="text-sm text-green-600 mb-1">Scout Bonus</div>
              <div className="text-2xl font-bold text-green-900">
                +{scoutBonus} players
              </div>
              <div className="text-xs text-green-700 mt-1">Transfer Market Quality</div>
            </div>
          </div>
        </div>

        {/* Current Staff */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Your Staff ({gameState.playerTeam.staff.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameState.playerTeam.staff.map((staff) => {
              const canFire = gameState.playerTeam.staff.length > 1;

              return (
                <div
                  key={staff.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-normal"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {getRoleIcon(staff.role)} {staff.name}
                      </h3>
                      <p className="text-sm text-slate-500">{staff.specialty}</p>
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
                      <span className="text-slate-500">Skill:</span>
                      <span className="ml-2 font-semibold text-teal-600">
                        {staff.skill}/20
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Salary:</span>
                      <span className="ml-2 font-semibold text-slate-900">
                        £{staff.salary.toLocaleString()}/wk
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => actions.fireStaff(staff)}
                    disabled={!canFire}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canFire ? 'Fire (2 weeks severance)' : 'Cannot Fire (Min 1 staff)'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Staff - Managers */}
        {availableManagers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Available Managers ({availableManagers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableManagers.map((staff) => {
                const canAfford = gameState.finances.budget >= staff.salary * 4;
                const hasManager = !!manager;

                return (
                  <div
                    key={staff.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-normal"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {getRoleIcon(staff.role)} {staff.name}
                        </h3>
                        <p className="text-sm text-slate-500">{staff.specialty}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                          staff.role
                        )}`}
                      >
                        MANAGER
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600">
                          {staff.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Salary:</span>
                        <span className="ml-2 font-semibold text-slate-900">
                          £{staff.salary.toLocaleString()}/wk
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => actions.hireStaff(staff)}
                      disabled={!canAfford || hasManager}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Available Coaches ({availableCoaches.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCoaches.map((staff) => {
                const canAfford = gameState.finances.budget >= staff.salary * 4;
                const hasMaxCoaches = coaches.length >= 3;

                return (
                  <div
                    key={staff.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-normal"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {getRoleIcon(staff.role)} {staff.name}
                        </h3>
                        <p className="text-sm text-slate-500">{staff.specialty}</p>
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
                        <span className="text-slate-500">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600">
                          {staff.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Salary:</span>
                        <span className="ml-2 font-semibold text-slate-900">
                          £{staff.salary.toLocaleString()}/wk
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => actions.hireStaff(staff)}
                      disabled={!canAfford || hasMaxCoaches}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Available Scouts ({availableScouts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableScouts.map((staff) => {
                const canAfford = gameState.finances.budget >= staff.salary * 4;
                const hasScout = !!scout;

                return (
                  <div
                    key={staff.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-normal"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {getRoleIcon(staff.role)} {staff.name}
                        </h3>
                        <p className="text-sm text-slate-500">{staff.specialty}</p>
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
                        <span className="text-slate-500">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600">
                          {staff.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Salary:</span>
                        <span className="ml-2 font-semibold text-slate-900">
                          £{staff.salary.toLocaleString()}/wk
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => actions.hireStaff(staff)}
                      disabled={!canAfford || hasScout}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
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
