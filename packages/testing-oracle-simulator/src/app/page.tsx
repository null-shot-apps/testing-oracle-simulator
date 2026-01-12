'use client';

import { useEffect, useState, useRef } from 'react';
import Lobby from '@/components/Lobby';
import PublisherView from '@/components/PublisherView';
import SubscriberView from '@/components/SubscriberView';
import Dashboard from '@/components/Dashboard';
import { Player, PriceOption, MedianCalculation, WSMessage } from '@/types/game';

type GamePhase = 'connecting' | 'lobby' | 'playing' | 'finished';

export default function Game() {
  const [phase, setPhase] = useState<GamePhase>('connecting');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [medians, setMedians] = useState<Map<string, MedianCalculation>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number>(600000); // 10 minutes
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, gameEndTime - Date.now());
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [gameEndTime]);

  const connectWebSocket = () => {
    // For development, use mock WebSocket
    if (process.env.NODE_ENV === 'development') {
      setupMockGame();
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      const playerName = `Player${Math.floor(Math.random() * 1000)}`;
      sendMessage({ type: 'join', payload: { name: playerName } });
    };
    
    ws.onmessage = (event) => {
      const message: WSMessage = JSON.parse(event.data);
      handleMessage(message);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };
    
    wsRef.current = ws;
  };

  const setupMockGame = () => {
    // Mock setup for development
    const mockPlayer: Player = {
      id: 'player-1',
      name: 'You',
      role: null,
      credits: 1000,
      subscriberMode: null,
      submissionCount: 0,
      accuracyScore: 0,
      tradesExecuted: 0,
      profitLoss: 0,
    };

    const mockOptions: PriceOption[] = [
      { id: 'btc', name: 'Bitcoin', currentPrice: 45000 },
      { id: 'eth', name: 'Ethereum', currentPrice: 2500 },
      { id: 'gold', name: 'Gold', currentPrice: 2000 },
      { id: 'oil', name: 'Crude Oil', currentPrice: 75 },
      { id: 'sp500', name: 'S&P 500', currentPrice: 4500 },
    ];

    setCurrentPlayer(mockPlayer);
    setPlayers([mockPlayer]);
    setPriceOptions(mockOptions);
    setPhase('lobby');
  };

  const sendMessage = (message: WSMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'game_state':
        setPlayers(message.payload.players);
        setCurrentPlayer(message.payload.currentPlayer);
        setPriceOptions(message.payload.priceOptions);
        setPhase(message.payload.phase);
        if (message.payload.gameEndTime) {
          setGameEndTime(message.payload.gameEndTime);
        }
        break;
      
      case 'median_update':
        setMedians(new Map(Object.entries(message.payload.medians)));
        break;
      
      case 'game_end':
        setPhase('finished');
        break;
    }
  };

  const handleRoleSelect = (role: 'publisher' | 'subscriber') => {
    if (!currentPlayer) return;
    
    const updated = { ...currentPlayer, role };
    setCurrentPlayer(updated);
    setPlayers(players.map(p => p.id === currentPlayer.id ? updated : p));
    
    sendMessage({ type: 'role_select', payload: { role } });
  };

  const handleSubscriberModeSelect = (mode: 'pull' | 'push') => {
    if (!currentPlayer) return;
    
    const updated = { 
      ...currentPlayer, 
      subscriberMode: mode,
      credits: mode === 'push' ? currentPlayer.credits - 500 : currentPlayer.credits
    };
    setCurrentPlayer(updated);
    setPlayers(players.map(p => p.id === currentPlayer.id ? updated : p));
    
    sendMessage({ type: 'subscribe', payload: { mode } });
  };

  const handleStartGame = () => {
    setPhase('playing');
    setGameEndTime(Date.now() + 600000);
    sendMessage({ type: 'start_game', payload: {} });
  };

  const handleSubmitPrice = (optionId: string, price: number) => {
    sendMessage({ type: 'price_submit', payload: { optionId, price } });
  };

  const handleTrade = (optionId: string) => {
    if (!currentPlayer) return;
    
    const cost = currentPlayer.subscriberMode === 'pull' ? 2 : 0;
    const updated = {
      ...currentPlayer,
      credits: currentPlayer.credits - cost,
      tradesExecuted: (currentPlayer.tradesExecuted || 0) + 1,
    };
    setCurrentPlayer(updated);
    setPlayers(players.map(p => p.id === currentPlayer.id ? updated : p));
    
    sendMessage({ type: 'trade', payload: { optionId } });
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const canStartGame = players.length >= 3 && 
    players.every(p => p.role !== null) &&
    players.filter(p => p.role === 'subscriber').every(p => p.subscriberMode !== null);

  if (phase === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <div className="text-2xl font-bold">Connecting to game...</div>
        </div>
      </div>
    );
  }

  if (phase === 'lobby') {
    return (
      <Lobby
        players={players}
        currentPlayer={currentPlayer}
        onRoleSelect={handleRoleSelect}
        onSubscriberModeSelect={handleSubscriberModeSelect}
        onStartGame={handleStartGame}
        canStartGame={canStartGame}
      />
    );
  }

  if (phase === 'playing' && currentPlayer) {
    if (currentPlayer.role === 'publisher') {
      return (
        <PublisherView
          priceOptions={priceOptions}
          onSubmitPrice={handleSubmitPrice}
          timeRemaining={timeRemaining}
        />
      );
    } else {
      return (
        <SubscriberView
          priceOptions={priceOptions}
          medians={medians}
          currentPlayer={currentPlayer}
          onTrade={handleTrade}
          timeRemaining={timeRemaining}
        />
      );
    }
  }

  if (phase === 'finished' && currentPlayer) {
    return (
      <Dashboard
        players={players}
        currentPlayer={currentPlayer}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return null;
}

