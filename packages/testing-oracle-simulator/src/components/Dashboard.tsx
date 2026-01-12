'use client';

import { Player } from '@/types/game';

interface DashboardProps {
  players: Player[];
  currentPlayer: Player;
  onPlayAgain: () => void;
}

export default function Dashboard({ players, currentPlayer, onPlayAgain }: DashboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = a.credits + (a.profitLoss || 0);
    const scoreB = b.credits + (b.profitLoss || 0);
    return scoreB - scoreA;
  });

  const currentPlayerRank = sortedPlayers.findIndex(p => p.id === currentPlayer.id) + 1;
  const publishers = sortedPlayers.filter(p => p.role === 'publisher');
  const subscribers = sortedPlayers.filter(p => p.role === 'subscriber');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">🏆 Game Over!</h1>
          <p className="text-2xl text-gray-300">
            You finished #{currentPlayerRank} out of {players.length} players
          </p>
        </div>

        {/* Your Stats */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 mb-8 border-2 border-purple-400">
          <h2 className="text-2xl font-semibold mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Role</div>
              <div className="text-xl font-bold capitalize">{currentPlayer.role}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Final Credits</div>
              <div className="text-xl font-bold text-yellow-400">{currentPlayer.credits}</div>
            </div>
            {currentPlayer.role === 'publisher' && (
              <>
                <div>
                  <div className="text-sm text-gray-400">Submissions</div>
                  <div className="text-xl font-bold">{currentPlayer.submissionCount || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                  <div className="text-xl font-bold text-green-400">
                    {((currentPlayer.accuracyScore || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </>
            )}
            {currentPlayer.role === 'subscriber' && (
              <>
                <div>
                  <div className="text-sm text-gray-400">Trades</div>
                  <div className="text-xl font-bold">{currentPlayer.tradesExecuted || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Profit/Loss</div>
                  <div className={`text-xl font-bold ${(currentPlayer.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(currentPlayer.profitLoss || 0) >= 0 ? '+' : ''}{(currentPlayer.profitLoss || 0).toFixed(2)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Leaderboards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Publishers Leaderboard */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">📊 Top Publishers</h2>
            <div className="space-y-2">
              {publishers.slice(0, 10).map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === currentPlayer.id 
                      ? 'bg-purple-500/30 border border-purple-400' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-xs text-gray-400">
                        {player.submissionCount} submissions • {((player.accuracyScore || 0) * 100).toFixed(1)}% accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-400">{player.credits}</div>
                    <div className="text-xs text-gray-400">credits</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribers Leaderboard */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">💰 Top Subscribers</h2>
            <div className="space-y-2">
              {subscribers.slice(0, 10).map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === currentPlayer.id 
                      ? 'bg-purple-500/30 border border-purple-400' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-xs text-gray-400">
                        {player.tradesExecuted} trades • {player.subscriberMode === 'pull' ? '🔄 Pull' : '📡 Push'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-400">{player.credits}</div>
                    <div className={`text-xs ${(player.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(player.profitLoss || 0) >= 0 ? '+' : ''}{(player.profitLoss || 0).toFixed(2)} P/L
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-xl font-semibold transition-all shadow-lg shadow-purple-500/50"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

