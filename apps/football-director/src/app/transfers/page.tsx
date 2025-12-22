'use client';

import { useGameState } from '../../hooks/useGameState';
import Link from 'next/link';
import { TransferMarket } from '@playground/football-director-engine';

export default function TransfersPage() {
  const { gameState, loading, error, actions } = useGameState();

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

  const transferMarket = new TransferMarket();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-teal-500 dark:bg-dark-teal-600 text-cream-100 dark:text-dark-text-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">⚽ Transfer Market</h1>
              <p className="text-teal-100 dark:text-dark-text-secondary mt-2">
                Budget: £{gameState.finances.budget.toLocaleString()}
              </p>
            </div>
            <Link
              href="/"
              className="bg-white dark:bg-dark-bg-secondary text-teal-600 dark:text-teal-400 px-6 py-3 rounded-lg font-semibold hover:bg-cream-100 dark:hover:bg-dark-bg-tertiary transition-normal"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Available Players */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-dark-border-primary">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
            Available Players ({gameState.transferMarket.length})
          </h2>

          {gameState.transferMarket.length === 0 ? (
            <p className="text-slate-500 dark:text-dark-text-secondary text-center py-8">
              No players available. Check back next week!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameState.transferMarket.map((listing) => {
                const canAfford = gameState.finances.budget >= listing.askingPrice;
                const squadFull = gameState.playerTeam.players.length >= 25;

                return (
                  <div
                    key={listing.id}
                    className="border border-gray-200 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary rounded-lg p-4 hover:shadow-md transition-normal"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                          {listing.player.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
                          {listing.sellingTeamName}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          listing.player.position === 'FWD'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                            : listing.player.position === 'MID'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
                            : listing.player.position === 'DEF'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700'
                        }`}
                      >
                        {listing.player.position}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Age:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          {listing.player.age}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                          {listing.player.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Wages:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{listing.player.wages.toLocaleString()}/wk
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Price:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{listing.askingPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => actions.buyPlayer(listing)}
                      disabled={!canAfford || squadFull}
                      className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {squadFull
                        ? 'Squad Full'
                        : !canAfford
                        ? 'Cannot Afford'
                        : 'Sign Player'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Your Squad */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border-primary">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-dark-text-primary mb-6">
            Your Squad ({gameState.playerTeam.players.length}/25)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameState.playerTeam.players
              .sort((a, b) => b.skill - a.skill)
              .map((player) => {
                const estimatedValue = transferMarket.calculatePlayerValue(player);
                const canSell = gameState.playerTeam.players.length > 11;

                return (
                  <div
                    key={player.id}
                    className="border border-gray-200 dark:border-dark-border-primary bg-white dark:bg-dark-bg-tertiary rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary">
                          {player.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
                          {gameState.playerTeam.name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          player.position === 'FWD'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                            : player.position === 'MID'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
                            : player.position === 'DEF'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700'
                        }`}
                      >
                        {player.position}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Age:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          {player.age}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Skill:</span>
                        <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                          {player.skill}/20
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Wages:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{player.wages.toLocaleString()}/wk
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-dark-text-secondary">Value:</span>
                        <span className="ml-2 font-semibold text-slate-900 dark:text-dark-text-primary">
                          £{estimatedValue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => actions.sellPlayer(player, estimatedValue)}
                      disabled={!canSell}
                      className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {canSell ? 'List for Sale' : 'Cannot Sell (Min 11)'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </main>
    </div>
  );
}
