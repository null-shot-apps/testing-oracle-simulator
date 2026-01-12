'use client';

import { Player } from '@/types/game';

interface LobbyProps {
  players: Player[];
  currentPlayer: Player | null;
  onRoleSelect: (role: 'publisher' | 'subscriber') => void;
  onSubscriberModeSelect: (mode: 'pull' | 'push') => void;
  onStartGame: () => void;
  canStartGame: boolean;
}

export default function Lobby({ players, currentPlayer, onRoleSelect, onSubscriberModeSelect, onStartGame, canStartGame }: LobbyProps) {
  const selectedRole = currentPlayer?.role || null;
  const selectedMode = currentPlayer?.subscriberMode || null;

  const handleRoleSelect = (role: 'publisher' | 'subscriber') => {
    if (!selectedRole) {
      onRoleSelect(role);
    }
  };

  const handleModeSelect = (mode: 'pull' | 'push') => {
    onSubscriberModeSelect(mode);
  };

  const publishers = players.filter(p => p.role === 'publisher');
  const subscribers = players.filter(p => p.role === 'subscriber');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Market Data Trading Game</h1>
        <p className="text-gray-300 mb-8">Waiting for players... ({players.length}/50)</p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Role Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Choose Your Role</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('publisher')}
                disabled={!!selectedRole}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'publisher'
                    ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                } ${selectedRole && selectedRole !== 'publisher' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-left">
                  <h3 className="text-xl font-semibold mb-2">📊 Publisher</h3>
                  <p className="text-sm text-gray-300">Submit price data every 2 seconds. Earn accuracy points!</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('subscriber')}
                disabled={!!selectedRole}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedRole === 'subscriber'
                    ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                } ${selectedRole && selectedRole !== 'subscriber' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-left">
                  <h3 className="text-xl font-semibold mb-2">💰 Subscriber</h3>
                  <p className="text-sm text-gray-300">Trade based on median prices. Maximize your profit!</p>
                </div>
              </button>
            </div>

            {/* Subscriber Mode Selection */}
            {selectedRole === 'subscriber' && !selectedMode && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Choose Subscription Mode</h3>
                
                <button
                  onClick={() => handleModeSelect('pull')}
                  className="w-full p-4 rounded-lg border-2 bg-white/5 border-white/20 hover:bg-white/10 transition-all"
                >
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">🔄 Pull Mode</h4>
                    <p className="text-sm text-gray-300">Pay 2 credits per trade. Trade when you want!</p>
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelect('push')}
                  className="w-full p-4 rounded-lg border-2 bg-white/5 border-white/20 hover:bg-white/10 transition-all"
                >
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">📡 Push Mode</h4>
                    <p className="text-sm text-gray-300">Pay 500 credits upfront. Get updates every 30 seconds!</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Player List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Players</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Publishers ({publishers.length})</h3>
                <div className="space-y-2">
                  {publishers.map(p => (
                    <div key={p.id} className="bg-blue-500/20 rounded-lg p-2 text-sm">
                      {p.name} {p.id === currentPlayer?.id && '(You)'}
                    </div>
                  ))}
                  {publishers.length === 0 && <p className="text-gray-400 text-sm">No publishers yet</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-2">Subscribers ({subscribers.length})</h3>
                <div className="space-y-2">
                  {subscribers.map(p => (
                    <div key={p.id} className="bg-green-500/20 rounded-lg p-2 text-sm">
                      {p.name} {p.id === currentPlayer?.id && '(You)'} 
                      <span className="text-xs text-gray-400 ml-2">
                        ({p.subscriberMode === 'pull' ? '🔄 Pull' : '📡 Push'})
                      </span>
                    </div>
                  ))}
                  {subscribers.length === 0 && <p className="text-gray-400 text-sm">No subscribers yet</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="text-center">
          <button
            onClick={onStartGame}
            disabled={!canStartGame}
            className={`px-8 py-4 rounded-lg text-xl font-semibold transition-all ${
              canStartGame
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {canStartGame ? 'Start Game' : 'Waiting for all players to choose roles...'}
          </button>
          <p className="text-sm text-gray-400 mt-2">Minimum 3 players required</p>
        </div>
      </div>
    </div>
  );
}

