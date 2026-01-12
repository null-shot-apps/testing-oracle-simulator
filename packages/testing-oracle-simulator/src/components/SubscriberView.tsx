'use client';

import { useState } from 'react';
import { PriceOption, MedianCalculation, Player } from '@/types/game';

interface SubscriberViewProps {
  priceOptions: PriceOption[];
  medians: Map<string, MedianCalculation>;
  currentPlayer: Player;
  onTrade: (optionId: string) => void;
  timeRemaining: number;
}

export default function SubscriberView({ priceOptions, medians, currentPlayer, onTrade, timeRemaining }: SubscriberViewProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTrade = (optionId: string) => {
    onTrade(optionId);
    setSelectedOption(optionId);
    setTimeout(() => setSelectedOption(null), 1000);
  };

  const isPushMode = currentPlayer.subscriberMode === 'push';
  const nextPushUpdate = isPushMode && currentPlayer.lastPushUpdate 
    ? Math.max(0, 30000 - (Date.now() - currentPlayer.lastPushUpdate))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">💰 Subscriber Dashboard</h1>
            <p className="text-gray-300">
              {isPushMode ? '📡 Push Mode - Updates every 30s' : '🔄 Pull Mode - 2 credits per trade'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{formatTime(timeRemaining)}</div>
            <div className="text-sm text-gray-400">Time Remaining</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="text-sm text-gray-400">Credits</div>
            <div className="text-2xl font-bold text-yellow-400">{currentPlayer.credits}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="text-sm text-gray-400">Trades</div>
            <div className="text-2xl font-bold">{currentPlayer.tradesExecuted || 0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="text-sm text-gray-400">P/L</div>
            <div className={`text-2xl font-bold ${(currentPlayer.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(currentPlayer.profitLoss || 0) >= 0 ? '+' : ''}{(currentPlayer.profitLoss || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Push Mode Timer */}
        {isPushMode && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Next push update in:</span>
              <span className="text-2xl font-bold text-green-400">{(nextPushUpdate / 1000).toFixed(1)}s</span>
            </div>
            <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-100"
                style={{ width: `${(nextPushUpdate / 30000) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Market Data */}
        <div className="grid gap-4">
          {priceOptions.map(option => {
            const median = medians.get(option.id);
            const hasData = median && median.validSubmissions > 0;
            
            return (
              <div key={option.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{option.name}</h3>
                    <p className="text-sm text-gray-400">
                      {hasData ? `${median.validSubmissions} publishers` : 'No data yet'}
                    </p>
                  </div>
                  <div className="text-right">
                    {hasData ? (
                      <>
                        <div className="text-3xl font-bold text-green-400">
                          ${median.median.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {((median.median - option.currentPrice) / option.currentPrice * 100).toFixed(2)}% from ref
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl text-gray-500">--</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleTrade(option.id)}
                  disabled={!hasData || (currentPlayer.subscriberMode === 'pull' && currentPlayer.credits < 2)}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedOption === option.id
                      ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                      : hasData && (currentPlayer.subscriberMode === 'push' || currentPlayer.credits >= 2)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/50'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  {selectedOption === option.id 
                    ? '✓ Traded!' 
                    : !hasData 
                    ? 'Waiting for data...'
                    : currentPlayer.subscriberMode === 'pull' && currentPlayer.credits < 2
                    ? 'Insufficient credits'
                    : `Trade ${currentPlayer.subscriberMode === 'pull' ? '(-2 credits)' : ''}`
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

