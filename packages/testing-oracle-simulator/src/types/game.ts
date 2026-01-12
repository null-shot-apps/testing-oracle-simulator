export type PlayerRole = 'publisher' | 'subscriber' | null;
export type SubscriberMode = 'pull' | 'push' | null;

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  credits: number;
  subscriberMode: SubscriberMode;
  // Publisher stats
  submissionCount?: number;
  accuracyScore?: number;
  // Subscriber stats
  tradesExecuted?: number;
  profitLoss?: number;
  lastPushUpdate?: number;
}

export interface PriceOption {
  id: string;
  name: string;
  currentPrice: number;
}

export interface PriceSubmission {
  playerId: string;
  optionId: string;
  price: number;
  timestamp: number;
}

export interface MedianCalculation {
  optionId: string;
  median: number;
  validSubmissions: number;
  timestamp: number;
}

export interface GameState {
  lobbyId: string;
  players: Map<string, Player>;
  gameStarted: boolean;
  gameEndTime: number | null;
  priceOptions: PriceOption[];
  recentSubmissions: PriceSubmission[];
  currentMedians: Map<string, MedianCalculation>;
}

export interface WSMessage {
  type: 'join' | 'role_select' | 'price_submit' | 'subscribe' | 'trade' | 'game_state' | 'median_update' | 'game_end' | 'start_game';
  payload: any;
}

