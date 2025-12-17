/**
 * Football Director - Season Evaluation Component
 * Displays end-of-season board review
 */

'use client';

import { BoardObjective } from '@playground/football-director-engine';

interface SeasonEvaluationProps {
  evaluation: {
    objective: BoardObjective;
    satisfied: boolean;
    sacked: boolean;
    message: string;
  };
  onContinue: () => void;
  onGameOver: () => void;
}

export function SeasonEvaluation({ evaluation, onContinue, onGameOver }: SeasonEvaluationProps) {
  const { objective, satisfied, sacked, message } = evaluation;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-50 rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-lg ${sacked ? 'bg-red-600' : satisfied ? 'bg-green-500' : 'bg-orange-500'}`}>
          <h2 className="text-2xl font-bold text-white text-center">
            {sacked ? '🚨 SACKED' : satisfied ? '✅ SEASON REVIEW' : '⚠️ WARNING'}
          </h2>
        </div>

        <div className="p-8">
          {/* Objective */}
          <div className="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200">
            <div className="text-sm text-slate-500 mb-2">Season Objective</div>
            <div className="text-lg font-semibold text-slate-900 mb-4">
              {objective.description}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Target: {objective.type === 'league-position' ? `Position ${objective.target}` : `${objective.target} points`}
              </div>
              <div className={`text-lg font-bold ${
                objective.status === 'achieved' ? 'text-green-600' :
                objective.status === 'at-risk' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {objective.status === 'achieved' && '✅ ACHIEVED'}
                {objective.status === 'at-risk' && '⚠️ CLOSE'}
                {objective.status === 'failed' && '❌ FAILED'}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className={`rounded-lg p-6 mb-6 ${
            sacked ? 'bg-red-50 border-2 border-red-300' :
            satisfied ? 'bg-green-50 border-2 border-green-300' :
            'bg-orange-50 border-2 border-orange-300'
          }`}>
            <p className={`text-base leading-relaxed ${
              sacked ? 'text-red-900' :
              satisfied ? 'text-green-900' :
              'text-orange-900'
            }`}>
              {message}
            </p>
          </div>

          {/* Game Over Message */}
          {sacked && (
            <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
              <p className="text-lg font-semibold text-slate-900 mb-2">
                Your time at the club has come to an end.
              </p>
              <p className="text-sm text-slate-600">
                Thank you for playing Football Director!
              </p>
            </div>
          )}

          {/* Next Season Preview */}
          {!sacked && satisfied && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6 border-2 border-blue-300">
              <div className="text-sm text-blue-900 font-medium mb-2">
                📋 Looking Ahead
              </div>
              <p className="text-sm text-blue-800">
                The board will set new objectives for next season. Your players will develop over the summer. Good luck!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-8 py-6 rounded-b-lg">
          {sacked ? (
            <button
              onClick={onGameOver}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-normal"
            >
              Return to Main Menu
            </button>
          ) : (
            <button
              onClick={onContinue}
              className={`w-full ${
                satisfied ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
              } text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-normal`}
            >
              {satisfied ? 'Continue to Next Season' : 'Continue Under Pressure'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
