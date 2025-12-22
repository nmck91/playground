/**
 * Contract Negotiation Modal
 * Interface for negotiating player contracts
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Player, ContractManager } from '@playground/football-director-engine';

export interface ContractNegotiationModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onOffer: (weeklyWage: number, years: number) => void;
  currentBudget: number;
}

export function ContractNegotiationModal({
  player,
  isOpen,
  onClose,
  onOffer,
  currentBudget,
}: ContractNegotiationModalProps) {
  const [weeklyWage, setWeeklyWage] = useState(0);
  const [contractYears, setContractYears] = useState(3);

  const contractManager = new ContractManager();
  const demands = player ? contractManager.calculatePlayerDemands(player) : { minWage: 0, maxYears: 3 };

  // Initialize when player changes
  useEffect(() => {
    if (player) {
      setWeeklyWage(demands.minWage);
      setContractYears(Math.min(3, demands.maxYears));
    }
  }, [player?.id, demands.minWage, demands.maxYears]);

  if (!player) return null;

  const totalCost = weeklyWage * 52 * contractYears;
  const canAfford = totalCost <= currentBudget;
  const meetsMinimum = weeklyWage >= demands.minWage;

  const handleSubmit = () => {
    if (canAfford && meetsMinimum) {
      onOffer(weeklyWage, contractYears);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contract Negotiation - ${player.name}`}
      footer={
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-900 font-medium py-3 px-6 rounded-lg transition-normal"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canAfford || !meetsMinimum}
            className={`flex-1 font-medium py-3 px-6 rounded-lg transition-normal ${
              canAfford && meetsMinimum
                ? 'bg-teal-500 hover:bg-teal-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Make Offer
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Player info panel */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Position:</span> <strong>{player.position}</strong>
            </div>
            <div>
              <span className="text-slate-500">Skill:</span> <strong>{player.skill}</strong>
            </div>
            <div>
              <span className="text-slate-500">Age:</span> <strong>{player.age}</strong>
            </div>
            <div>
              <span className="text-slate-500">Current Wage:</span> <strong>£{player.wages.toLocaleString()}/wk</strong>
            </div>
          </div>
        </div>

        {/* Player demands */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Player Demands</h4>
          <div className="text-sm space-y-1">
            <div>Minimum Wage: <strong>£{demands.minWage.toLocaleString()}/wk</strong></div>
            <div>Max Contract: <strong>{demands.maxYears} years</strong></div>
          </div>
        </div>

        {/* Wage slider */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Weekly Wage: <strong>£{weeklyWage.toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min={Math.floor(demands.minWage * 0.8)}
            max={Math.floor(demands.minWage * 2)}
            step={100}
            value={weeklyWage}
            onChange={(e) => setWeeklyWage(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>£{Math.floor(demands.minWage * 0.8).toLocaleString()}</span>
            <span>£{Math.floor(demands.minWage * 2).toLocaleString()}</span>
          </div>
          {weeklyWage < demands.minWage && (
            <div className="text-red-600 text-sm mt-1">Below minimum demand</div>
          )}
        </div>

        {/* Contract years */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Contract Length: <strong>{contractYears} years</strong>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(y => (
              <button
                key={y}
                onClick={() => setContractYears(y)}
                disabled={y > demands.maxYears}
                className={`py-2 rounded-md text-sm font-medium transition-normal ${
                  contractYears === y
                    ? 'bg-teal-500 text-white'
                    : y <= demands.maxYears
                      ? 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {y}y
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Contract Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Weekly Wage:</span>
              <strong>£{weeklyWage.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Annual Cost:</span>
              <strong>£{(weeklyWage * 52).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Contract Length:</span>
              <strong>{contractYears} years</strong>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
              <span className="font-semibold">Total Value:</span>
              <strong className="text-lg">£{totalCost.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Your Budget:</span>
              <span className={canAfford ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                £{currentBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {!canAfford && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            Insufficient budget for this contract offer
          </div>
        )}
      </div>
    </Modal>
  );
}
