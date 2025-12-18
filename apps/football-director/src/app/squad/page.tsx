/**
 * Football Director - Squad Management Page
 * View and manage your squad
 */

'use client';

import { useState } from 'react';
import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';
import { Player, TransferMarket } from '@playground/football-director-engine';
import { PlayerStatsModal } from '../../components/game/PlayerStatsModal';

type SortBy = 'position' | 'skill' | 'age' | 'wages' | 'name';
type FilterPosition = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';

export default function SquadPage() {
  const { gameState, loading, error, actions } = useGameState();
  const [sortBy, setSortBy] = useState<SortBy>('position');
  const [filterPosition, setFilterPosition] = useState<FilterPosition>('ALL');
  const [showSellModal, setShowSellModal] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const transferMarket = new TransferMarket();

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

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DEF':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MID':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FWD':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSkillColor = (skill: number) => {
    if (skill >= 16) return 'text-green-600 font-bold';
    if (skill >= 12) return 'text-blue-600 font-semibold';
    if (skill >= 8) return 'text-slate-700';
    return 'text-slate-500';
  };

  const getSkillLabel = (skill: number) => {
    if (skill >= 18) return 'World Class';
    if (skill >= 16) return 'Excellent';
    if (skill >= 14) return 'Very Good';
    if (skill >= 12) return 'Good';
    if (skill >= 10) return 'Average';
    if (skill >= 8) return 'Below Average';
    return 'Poor';
  };

  const sortPlayers = (players: Player[]) => {
    const positionOrder = { GK: 1, DEF: 2, MID: 3, FWD: 4 };

    return [...players].sort((a, b) => {
      switch (sortBy) {
        case 'position':
          return positionOrder[a.position] - positionOrder[b.position];
        case 'skill':
          return b.skill - a.skill;
        case 'age':
          return a.age - b.age;
        case 'wages':
          return b.wages - a.wages;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const filterPlayers = (players: Player[]) => {
    if (filterPosition === 'ALL') return players;
    return players.filter((p) => p.position === filterPosition);
  };

  const filteredAndSorted = sortPlayers(filterPlayers(gameState.playerTeam.players));

  const positionCounts = {
    GK: gameState.playerTeam.players.filter((p) => p.position === 'GK').length,
    DEF: gameState.playerTeam.players.filter((p) => p.position === 'DEF').length,
    MID: gameState.playerTeam.players.filter((p) => p.position === 'MID').length,
    FWD: gameState.playerTeam.players.filter((p) => p.position === 'FWD').length,
  };

  const totalWages = gameState.playerTeam.players.reduce((sum, p) => sum + p.wages, 0);
  const avgSkill = (
    gameState.playerTeam.players.reduce((sum, p) => sum + p.skill, 0) /
    gameState.playerTeam.players.length
  ).toFixed(1);

  const handleViewStats = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerStats(true);
  };

  const handleSellClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowSellModal(true);
  };

  const handleSellConfirm = () => {
    if (selectedPlayer) {
      const estimatedValue = transferMarket.calculatePlayerValue(selectedPlayer);
      actions.sellPlayer(selectedPlayer, estimatedValue);
      setShowSellModal(false);
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-teal-500 text-cream-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Squad Management</h1>
              <p className="text-teal-100 mt-2">{gameState.playerTeam.name}</p>
            </div>
            <Link
              href="/"
              className="bg-white text-teal-600 hover:bg-teal-50 font-medium px-6 py-3 rounded-lg shadow-sm transition-normal"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Squad Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Squad Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-slate-500 mb-1">Total Players</div>
              <div className="text-2xl font-bold text-slate-900">
                {gameState.playerTeam.players.length} / 25
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Average Skill</div>
              <div className={`text-2xl font-bold ${getSkillColor(parseFloat(avgSkill))}`}>
                {avgSkill} / 20
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Weekly Wages</div>
              <div className="text-2xl font-bold text-slate-900">
                £{totalWages.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Position Split</div>
              <div className="text-sm text-slate-700 mt-1">
                GK: {positionCounts.GK} | DEF: {positionCounts.DEF} | MID: {positionCounts.MID} | FWD: {positionCounts.FWD}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-slate-700 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="position">Position</option>
                <option value="skill">Skill</option>
                <option value="age">Age</option>
                <option value="wages">Wages</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mr-2">Filter:</label>
              <div className="inline-flex gap-2">
                {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setFilterPosition(pos)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-normal ${
                      filterPosition === pos
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Players ({filteredAndSorted.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSorted.map((player) => {
              const estimatedValue = transferMarket.calculatePlayerValue(player);
              const canSell = gameState.playerTeam.players.length > 11;

              return (
                <div
                  key={player.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-normal"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{player.name}</h3>
                        {/* Injury Indicator */}
                        {player.injury && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300"
                            title={`${player.injury.description} - ${player.injury.weeksRemaining} weeks`}
                          >
                            🚑 {player.injury.weeksRemaining}w
                          </span>
                        )}
                        {/* Suspension Indicator */}
                        {player.suspendedUntil && gameState.season.currentWeek < player.suspendedUntil && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-300"
                            title={`Suspended until week ${player.suspendedUntil}`}
                          >
                            🟥 {player.suspendedUntil - gameState.season.currentWeek}w
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPositionColor(
                          player.position
                        )}`}
                      >
                        {player.position}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getSkillColor(player.skill)}`}>
                        {player.skill}
                      </div>
                      <div className="text-xs text-slate-500">{getSkillLabel(player.skill)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-slate-500">Age:</span>
                      <span className="ml-2 font-medium text-slate-900">{player.age}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Wages:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        £{player.wages.toLocaleString()}/wk
                      </span>
                    </div>
                  </div>

                  {/* Season Stats Preview */}
                  {player.stats && player.stats.appearances > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-xs font-semibold text-slate-700 mb-2">Season Stats</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-slate-500">Apps</div>
                          <div className="font-semibold text-slate-900">{player.stats.appearances}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-500">Goals</div>
                          <div className="font-semibold text-green-600">{player.stats.goals}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-500">Assists</div>
                          <div className="font-semibold text-blue-600">{player.stats.assists}</div>
                        </div>
                      </div>
                      {player.position === 'GK' && (
                        <div className="text-center mt-2 pt-2 border-t border-gray-200">
                          <div className="text-slate-500 text-xs">Clean Sheets</div>
                          <div className="font-semibold text-teal-600">{player.stats.cleanSheets}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-xs text-slate-500 mb-2">Estimated Value</div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-teal-600">
                        £{estimatedValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewStats(player)}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm px-4 py-2 rounded-lg transition-normal"
                      >
                        View Stats
                      </button>
                      <button
                        onClick={() => handleSellClick(player)}
                        disabled={!canSell}
                        className={`flex-1 text-sm px-4 py-2 rounded-lg transition-normal ${
                          canSell
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title={!canSell ? 'Cannot sell (minimum 11 players required)' : ''}
                      >
                        {canSell ? 'Sell' : 'Cannot Sell'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sell Confirmation Modal */}
      {showSellModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Confirm Sale</h3>
            <p className="text-slate-700 mb-6">
              Are you sure you want to list <strong>{selectedPlayer.name}</strong> for sale at{' '}
              <strong>£{transferMarket.calculatePlayerValue(selectedPlayer).toLocaleString()}</strong>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSellModal(false);
                  setSelectedPlayer(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-900 font-medium py-3 px-6 rounded-lg transition-normal"
              >
                Cancel
              </button>
              <button
                onClick={handleSellConfirm}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-normal"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Stats Modal */}
      <PlayerStatsModal
        player={selectedPlayer}
        isOpen={showPlayerStats}
        onClose={() => {
          setShowPlayerStats(false);
          setSelectedPlayer(null);
        }}
      />
    </div>
  );
}
