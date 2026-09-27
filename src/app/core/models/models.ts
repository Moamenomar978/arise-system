import { QuestType, Rank, Role, StatType } from './enums';

export interface AppUser {
  id: string;
  email: string;
  password: string; // NOTE: plain text — mock/demo only, there is no real backend here
  hunterName: string;
  role: Role;
  banned?: boolean;
  createdAt: string;
}

export interface PlayerStats {
  [StatType.STRENGTH]: number;
  [StatType.AGILITY]: number;
  [StatType.VITALITY]: number;
  [StatType.INTELLIGENCE]: number;
  [StatType.PERCEPTION]: number;
  [StatType.LUCK]: number;
}

export interface Player {
  userId: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  rank: Rank;
  availableStatPoints: number;
  stats: PlayerStats;
  hp: number;
  maxHp: number;
  gold: number;
  streak: number;
  lastActiveDate: string | null; // yyyy-mm-dd, used for daily reset + streak logic
  titles: string[];
}

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  category: StatType;
  xpReward: number;
  goldReward: number;
  statPointReward?: number;
  difficulty: Rank;
  isRepeatable: boolean;
  createdBy: 'SYSTEM' | string; // 'SYSTEM' or admin userId
  active: boolean;
}

export interface QuestLogEntry {
  id: string;
  userId: string;
  questId: string;
  questTitle: string;
  xpEarned: number;
  goldEarned: number;
  completedAt: string;
  dateKey: string; // yyyy-mm-dd, for daily-quest completion tracking
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  createdBy: string;
}

export interface Announcement {
  id: string;
  message: string;
  createdAt: string;
}

export interface SystemMessage {
  id: number;
  text: string;
  kind: 'info' | 'success' | 'warning' | 'danger';
}
