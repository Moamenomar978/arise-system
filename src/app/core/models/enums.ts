export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Rank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
}

export enum StatType {
  STRENGTH = 'strength',
  AGILITY = 'agility',
  VITALITY = 'vitality',
  INTELLIGENCE = 'intelligence',
  PERCEPTION = 'perception',
  LUCK = 'luck',
}

export enum QuestType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  SPECIAL = 'SPECIAL',
  STORY = 'STORY',
}

// Rank thresholds by player level — lowest level that unlocks the rank.
export const RANK_THRESHOLDS: { rank: Rank; minLevel: number }[] = [
  { rank: Rank.E, minLevel: 1 },
  { rank: Rank.D, minLevel: 11 },
  { rank: Rank.C, minLevel: 26 },
  { rank: Rank.B, minLevel: 51 },
  { rank: Rank.A, minLevel: 81 },
  { rank: Rank.S, minLevel: 121 },
];

export function rankForLevel(level: number): Rank {
  let current = Rank.E;
  for (const t of RANK_THRESHOLDS) {
    if (level >= t.minLevel) current = t.rank;
  }
  return current;
}

export const STAT_LABELS: Record<StatType, string> = {
  [StatType.STRENGTH]: 'Strength',
  [StatType.AGILITY]: 'Agility',
  [StatType.VITALITY]: 'Vitality',
  [StatType.INTELLIGENCE]: 'Intelligence',
  [StatType.PERCEPTION]: 'Perception',
  [StatType.LUCK]: 'Luck',
};
