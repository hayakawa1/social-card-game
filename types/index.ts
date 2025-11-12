// Player Types
export interface Player {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  level: number;
  exp: number;
  gold: number;
  gems: number;
  stamina: number;
  maxStamina: number;
  lastStaminaUpdate: Date;
  iconUrl: string;
  consecutiveLoginDays: number;
  lastLoginDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PlayerProfile = Omit<Player, 'passwordHash' | 'email'>;

// Card Types
export type CardRarity = 'common' | 'rare' | 'super_rare' | 'ultra_rare';
export type CardAttribute = 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark';

export interface CardMaster {
  id: string;
  name: string;
  rarity: CardRarity;
  attribute: CardAttribute;
  cost: number;
  baseAttack: number;
  baseDefense: number;
  maxLevel: number;
  skillId?: string;
  imageUrl: string;
  description: string;
}

export interface PlayerCard {
  id: string;
  playerId: string;
  cardMasterId: string;
  level: number;
  exp: number;
  attack: number;
  defense: number;
  acquiredAt: Date;
}

// Deck Types
export interface Deck {
  id: string;
  playerId: string;
  name: string;
  cardIds: string[];
  totalCost: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Battle Types
export type BattleType = 'quest' | 'pvp' | 'friend';

export interface FieldCard {
  cardId: string;
  position: number;
  canAttack: boolean;
}

export interface Battle {
  id: string;
  battleType: BattleType;
  player1Id: string;
  player2Id: string;
  player1DeckId: string;
  player2DeckId: string;
  currentTurn: number;
  currentPlayerId: string;
  player1Life: number;
  player2Life: number;
  player1Field: FieldCard[];
  player2Field: FieldCard[];
  player1Hand: string[];
  player2Hand: string[];
  player1Deck: string[];
  player2Deck: string[];
  winnerId?: string;
  rewards?: Reward[];
  startedAt: Date;
  finishedAt?: Date;
}

export interface BattleState {
  battle: Battle;
  currentPlayerHand: string[];
  opponentFieldCount: number;
}

export interface BattleResult {
  winnerId: string;
  loserId: string;
  rewards: Reward[];
}

// Quest Types
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

export interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: QuestDifficulty;
  staminaCost: number;
  requiredLevel: number;
  enemyDeckId: string;
  rewards: Reward[];
  firstClearRewards: Reward[];
  isAvailable: boolean;
}

export interface QuestProgress {
  playerId: string;
  questId: string;
  cleared: boolean;
  clearedAt?: Date;
  attempts: number;
}

// Friend Types
export interface Friend {
  id: string;
  playerId: string;
  friendId: string;
  friendshipPoints: number;
  lastInteraction: Date;
  createdAt: Date;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  respondedAt?: Date;
}

// Gacha Types
export interface GachaBanner {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  costGold?: number;
  costGems?: number;
  featuredCardIds: string[];
  rateUpCardIds: string[];
  guaranteeThreshold: number;
}

export type PullType = 'single' | 'multi';
export type CurrencyType = 'gold' | 'gems';

export interface GachaHistory {
  id: string;
  playerId: string;
  bannerId: string;
  pullType: PullType;
  cardsObtained: string[];
  currencyUsed: CurrencyType;
  amount: number;
  pulledAt: Date;
}

// Ranking Types
export type RankingType = 'pvp' | 'level';

export interface Ranking {
  playerId: string;
  rankingType: RankingType;
  score: number;
  rank: number;
  season: string;
  updatedAt: Date;
}

export interface RankingEntry {
  rank: number;
  playerId: string;
  username: string;
  level: number;
  iconUrl: string;
  score: number;
}

// Reward Types
export type RewardType = 'gold' | 'gems' | 'exp' | 'card' | 'stamina';

export interface Reward {
  type: RewardType;
  amount?: number;
  cardId?: string;
}

// Error Types
export enum ErrorCode {
  // Auth errors (1000s)
  INVALID_TOKEN = 1001,
  EXPIRED_TOKEN = 1002,
  UNAUTHORIZED = 1003,

  // Player errors (2000s)
  PLAYER_NOT_FOUND = 2001,
  INSUFFICIENT_GOLD = 2002,
  INSUFFICIENT_GEMS = 2003,
  INSUFFICIENT_STAMINA = 2004,
  LEVEL_TOO_LOW = 2005,

  // Card errors (3000s)
  CARD_NOT_FOUND = 3001,
  CARD_NOT_OWNED = 3002,
  INVALID_DECK_SIZE = 3003,
  DECK_COST_EXCEEDED = 3004,
  DUPLICATE_CARD_LIMIT = 3005,

  // Battle errors (4000s)
  BATTLE_NOT_FOUND = 4001,
  INVALID_BATTLE_ACTION = 4002,
  NOT_PLAYER_TURN = 4003,
  BATTLE_ALREADY_FINISHED = 4004,

  // Gacha errors (5000s)
  BANNER_NOT_AVAILABLE = 5001,
  INSUFFICIENT_CURRENCY = 5002,

  // Social errors (6000s)
  FRIEND_LIMIT_REACHED = 6001,
  ALREADY_FRIENDS = 6002,
  FRIEND_REQUEST_NOT_FOUND = 6003,

  // System errors (9000s)
  INTERNAL_SERVER_ERROR = 9001,
  DATABASE_ERROR = 9002,
  VALIDATION_ERROR = 9003,
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}
