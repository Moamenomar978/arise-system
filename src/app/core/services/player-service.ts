import { Injectable, inject, signal } from '@angular/core';
import { Player, PlayerStats } from '../models/models';
import { Rank, StatType, rankForLevel } from '../models/enums';
import { NotificationService } from './notification-service';

const PLAYERS_KEY = 'arise_players';
const STAT_POINTS_PER_LEVEL = 3;
const HP_LOSS_ON_MISSED_DAY = 10;
const HP_REGEN_ON_DAILY_COMPLETE = 5;

function emptyStats(): PlayerStats {
  return {
    [StatType.STRENGTH]: 5,
    [StatType.AGILITY]: 5,
    [StatType.VITALITY]: 5,
    [StatType.INTELLIGENCE]: 5,
    [StatType.PERCEPTION]: 5,
    [StatType.LUCK]: 5,
  };
}

function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class PlayerService {

  private notify = inject(NotificationService);

  // signal wrapper so components can react to the current player's changes
  players = signal<Record<string, Player>>(this.loadAll());

  private loadAll(): Record<string, Player> {
    const raw = localStorage.getItem(PLAYERS_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  private saveAll(all: Record<string, Player>) {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(all));
    this.players.set(all);
  }

  getPlayer(userId: string): Player {
    const all = this.players();
    if (all[userId]) return all[userId];

    const fresh: Player = {
      userId,
      level: 1,
      currentXP: 0,
      xpToNextLevel: xpForLevel(1),
      rank: Rank.E,
      availableStatPoints: 0,
      stats: emptyStats(),
      hp: 100,
      maxHp: 100,
      gold: 0,
      streak: 0,
      lastActiveDate: null,
      titles: [],
    };

    this.saveAll({ ...all, [userId]: fresh });
    return fresh;
  }

  allPlayers(): Player[] {
    return Object.values(this.players());
  }

  private update(userId: string, mutate: (p: Player) => Player) {
    const all = this.players();
    const current = all[userId] ?? this.getPlayer(userId);
    const updated = mutate({ ...current });
    this.saveAll({ ...all, [userId]: updated });
    return updated;
  }

  /** Award XP, handling multi-level-ups and rank promotion in one pass. */
  addXp(userId: string, amount: number) {
    return this.update(userId, (p) => {
      p.currentXP += amount;

      while (p.currentXP >= p.xpToNextLevel) {
        p.currentXP -= p.xpToNextLevel;
        p.level += 1;
        p.xpToNextLevel = xpForLevel(p.level);
        p.availableStatPoints += STAT_POINTS_PER_LEVEL;
        this.notify.triggerLevelUp(p.level);

        const newRank = rankForLevel(p.level);
        if (newRank !== p.rank) {
          p.rank = newRank;
          this.notify.triggerRankUp(newRank);
        }
      }
      return p;
    });
  }

  addGold(userId: string, amount: number) {
    return this.update(userId, p => ({ ...p, gold: p.gold + amount }));
  }

  spendGold(userId: string, amount: number): boolean {
    const p = this.getPlayer(userId);
    if (p.gold < amount) return false;
    this.update(userId, cur => ({ ...cur, gold: cur.gold - amount }));
    return true;
  }

  /** Grants bonus stat points directly (e.g. special-quest rewards), separate from level-up points. */
  addStatPoints(userId: string, points: number) {
    this.update(userId, p => ({ ...p, availableStatPoints: p.availableStatPoints + points }));
  }

  allocateStat(userId: string, stat: StatType, points = 1) {
    this.update(userId, (p) => {
      if (p.availableStatPoints < points) return p;
      p.availableStatPoints -= points;
      p.stats = { ...p.stats, [stat]: p.stats[stat] + points };
      return p;
    });
  }

  awardTitle(userId: string, title: string) {
    this.update(userId, (p) => {
      if (p.titles.includes(title)) return p;
      p.titles = [...p.titles, title];
      this.notify.push(`[SYSTEM] New Title Earned: "${title}"`, 'success');
      return p;
    });
  }

  regenHpForDailyCompletion(userId: string) {
    this.update(userId, p => ({ ...p, hp: Math.min(p.maxHp, p.hp + HP_REGEN_ON_DAILY_COMPLETE) }));
  }

  /**
   * Call once per session load. If the player missed all daily quests
   * yesterday, apply the HP penalty and reset the streak. Safe to call
   * multiple times per day — it only acts once per calendar day.
   */
  checkDailyPenalty(userId: string, completedAllDailiesYesterday: boolean) {
    this.update(userId, (p) => {
      const today = todayKey();
      if (p.lastActiveDate === today) return p; // already processed today

      if (p.lastActiveDate !== null && !completedAllDailiesYesterday) {
        p.hp = Math.max(0, p.hp - HP_LOSS_ON_MISSED_DAY);
        p.streak = 0;
        this.notify.push('[SYSTEM] Warning: You failed to complete yesterday\'s Daily Quest. Penalty applied: -10 HP.', 'danger');
      }

      p.lastActiveDate = today;
      return p;
    });
  }

  incrementStreak(userId: string) {
    this.update(userId, p => ({ ...p, streak: p.streak + 1 }));
  }

  resetPlayer(userId: string) {
    const all = this.players();
    delete all[userId];
    this.saveAll({ ...all });
    this.getPlayer(userId);
  }
}
