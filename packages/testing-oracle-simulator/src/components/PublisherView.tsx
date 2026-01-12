'use client';

import { useState, useEffect } from 'react';
import { PriceOption } from '@/types/game';

interface PublisherViewProps {
  priceOptions: PriceOption[];
  onSubmitPrice: (optionId: string, price: number) => void;
  timeRemaining: number;
}

export default function PublisherView({ priceOptions, onSubmitPrice, timeRemaining }: PublisherViewProps) {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [lastSubmit, setLastSubmit] = useState<number>(0);

  useEffect(() => {
    // Auto-submit every 2 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSubmit >= 2000) {
        submitAllPrices();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [prices, lastSubmit]);

  const submitAllPrices = () => {
    for (const option of priceOptions) {
      const priceStr = prices[option.id];
      if (priceStr) {
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0) {
          onSubmitPrice(option.id, price);
        }
      }
    }
    setLastSubmit(Date.now());
  };

  const handlePriceChange = (optionId: string, value: string) => {
    setPrices(prev => ({ ...prev, [optionId]: value }));
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextSubmitIn = Math.max(0, 2000 - (Date.now() - lastSubmit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📊 Publisher Dashboard</h1>
            <p className="text-gray-300">Submit prices every 2 seconds</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{formatTime(timeRemaining)}</div>
            <div className="text-sm text-gray-400">Time Remaining</div>
          </div>
        </div>

        {/* Next Submit Timer */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Next auto-submit in:</span>
            <span className="text-2xl font-bold text-blue-400">{(nextSubmitIn / 1000).toFixed(1)}s</span>
          </div>
          <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-100"
              style={{ width: `${(nextSubmitIn / 2000) * 100}%` }}
            />
          </div>
        </div>

        {/* Price Input Grid */}
        <div className="grid gap-4">
          {priceOptions.map(option => (
            <div key={option.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{option.name}</h3>
                  <p className="text-sm text-gray-400">Reference: ${option.currentPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <input
                    type="number"
                    value={prices[option.id] || ''}
                    onChange={(e) => handlePriceChange(option.id, e.target.value)}
                    placeholder={option.currentPrice.toString()}
                    className="w-40 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-xl font-semibold text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
              
              {/* Quick adjust buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const current = parseFloat(prices[option.id] || option.currentPrice.toString());
                    handlePriceChange(option.id, (current * 0.99).toFixed(2));
                  }}
                  className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-all"
                >
                  -1%
                </button>
                <button
                  onClick={() => {
                    const current = parseFloat(prices[option.id] || option.currentPrice.toString());
                    handlePriceChange(option.id, (current * 0.995).toFixed(2));
                  }}
                  className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-all"
                >
                  -0.5%
                </button>
                <button
                  onClick={() => handlePriceChange(option.id, option.currentPrice.toString())}
                  className="flex-1 px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg text-sm transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    const current = parseFloat(prices[option.id] || option.currentPrice.toString());
                    handlePriceChange(option.id, (current * 1.005).toFixed(2));
                  }}
                  className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-sm transition-all"
                >
                  +0.5%
                </button>
                <button
                  onClick={() => {
                    const current = parseFloat(prices[option.id] || option.currentPrice.toString());
                    handlePriceChange(option.id, (current * 1.01).toFixed(2));
                  }}
                  className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-sm transition-all"
                >
                  +1%
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Manual Submit Button */}
        <button
          onClick={submitAllPrices}
          className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-xl font-semibold transition-all shadow-lg shadow-blue-500/50"
        >
          Submit Now
        </button>
      </div>
    </div>
  );
}

