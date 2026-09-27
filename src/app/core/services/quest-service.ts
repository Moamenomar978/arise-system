import { Injectable, inject, signal } from '@angular/core';
import { QuestLogEntry, QuestTemplate } from '../models/models';
import { QuestType, Rank, StatType } from '../models/enums';
import { PlayerService } from './player-service';
import { NotificationService } from './notification-service';

const TEMPLATES_KEY = 'arise_quest_templates';
const LOG_KEY = 'arise_quest_log';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultTemplates(): QuestTemplate[] {
  return [
    {
      id: 'd-exercise', title: 'Exercise', description: 'Train your body for at least 30 minutes.',
      type: QuestType.DAILY, category: StatType.STRENGTH, xpReward: 20, goldReward: 10,
      difficulty: Rank.E, isRepeatable: true, createdBy: 'SYSTEM', active: true,
    },
    {
      id: 'd-study', title: 'Study / Read', description: 'Study or read for at least 1 hour.',
      type: QuestType.DAILY, category: StatType.INTELLIGENCE, xpReward: 20, goldReward: 10,
      difficulty: Rank.E, isRepeatable: true, createdBy: 'SYSTEM', active: true,
    },
    {
      id: 'd-meditate', title: 'Meditate', description: 'Meditate for at least 10 minutes.',
      type: QuestType.DAILY, category: StatType.PERCEPTION, xpReward: 10, goldReward: 5,
      difficulty: Rank.E, isRepeatable: true, createdBy: 'SYSTEM', active: true,
    },
    {
      id: 'd-sleep', title: 'Sleep 7+ Hours', description: 'Get at least 7 hours of sleep.',
      type: QuestType.DAILY, category: StatType.VITALITY, xpReward: 10, goldReward: 5,
      difficulty: Rank.E, isRepeatable: true, createdBy: 'SYSTEM', active: true,
    },
    {
      id: 'd-skill', title: 'Practice a Skill', description: 'Practice any skill for 30 minutes.',
      type: QuestType.DAILY, category: StatType.LUCK, xpReward: 10, goldReward: 5,
      difficulty: Rank.E, isRepeatable: true, createdBy: 'SYSTEM', active: true,
    },
    {
      id: 'w-deepwork', title: 'Deep Work Week', description: 'Complete 10 hours of focused, distraction-free work this week.',
      type: QuestType.WEEKLY, category: StatType.INTELLIGENCE, xpReward: 120, goldReward: 60,
      difficulty: Rank.D, isRepeatable: true, createdBy: 'SYSTEM', active: true,
    },
    {
      id: 's-first-gate', title: 'First Gate', description: 'Complete your first 5 daily quests to prove you belong in the System.',
      type: QuestType.SPECIAL, category: StatType.VITALITY, xpReward: 100, goldReward: 50, statPointReward: 2,
      difficulty: Rank.E, isRepeatable: false, createdBy: 'SYSTEM', active: true,
    },
    {
      id: 'story-30-books', title: 'The Scholar\'s Path', description: 'Read 10 full books, cover to cover.',
      type: QuestType.STORY, category: StatType.INTELLIGENCE, xpReward: 500, goldReward: 200, statPointReward: 5,
      difficulty: Rank.C, isRepeatable: false, createdBy: 'SYSTEM', active: true,
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class QuestService {

  private playerService = inject(PlayerService);
  private notify = inject(NotificationService);

  templates = signal<QuestTemplate[]>(this.loadTemplates());
  log = signal<QuestLogEntry[]>(this.loadLog());

  private loadTemplates(): QuestTemplate[] {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
    const seeded = defaultTemplates();
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(seeded));
    return seeded;
  }

  private saveTemplates(templates: QuestTemplate[]) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    this.templates.set(templates);
  }

  private loadLog(): QuestLogEntry[] {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveLog(log: QuestLogEntry[]) {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    this.log.set(log);
  }

  activeTemplatesByType(type: QuestType): QuestTemplate[] {
    return this.templates().filter(t => t.type === type && t.active);
  }

  userLog(userId: string): QuestLogEntry[] {
    return this.log()
      .filter(l => l.userId === userId)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }

  /** Has this quest already been logged for this user today? (used for dailies) */
  isCompletedToday(userId: string, questId: string): boolean {
    const today = todayKey();
    return this.log().some(l => l.userId === userId && l.questId === questId && l.dateKey === today);
  }

  isCompletedEver(userId: string, questId: string): boolean {
    return this.log().some(l => l.userId === userId && l.questId === questId);
  }

  todaysDailyQuests(userId: string) {
    return this.activeTemplatesByType(QuestType.DAILY).map(q => ({
      ...q,
      completed: this.isCompletedToday(userId, q.id),
    }));
  }

  didCompleteAllDailies(userId: string, dateKey: string): boolean {
    const dailies = this.activeTemplatesByType(QuestType.DAILY);
    if (dailies.length === 0) return true;
    return dailies.every(q => this.log().some(
      l => l.userId === userId && l.questId === q.id && l.dateKey === dateKey
    ));
  }

  completeQuest(userId: string, questId: string): { ok: boolean; error?: string } {
    const quest = this.templates().find(t => t.id === questId);
    if (!quest) return { ok: false, error: 'Quest not found.' };

    if (quest.type === QuestType.DAILY && this.isCompletedToday(userId, questId)) {
      return { ok: false, error: 'Already completed today.' };
    }
    if (!quest.isRepeatable && this.isCompletedEver(userId, questId)) {
      return { ok: false, error: 'This quest has already been completed.' };
    }

    const entry: QuestLogEntry = {
      id: crypto.randomUUID(),
      userId,
      questId: quest.id,
      questTitle: quest.title,
      xpEarned: quest.xpReward,
      goldEarned: quest.goldReward,
      completedAt: new Date().toISOString(),
      dateKey: todayKey(),
    };
    this.saveLog([...this.log(), entry]);

    this.playerService.addXp(userId, quest.xpReward);
    this.playerService.addGold(userId, quest.goldReward);
    if (quest.statPointReward) {
      this.playerService.addStatPoints(userId, quest.statPointReward);
    }
    this.notify.push(`[SYSTEM] Quest Complete: "${quest.title}"! +${quest.xpReward} XP, +${quest.goldReward} Gold`, 'success');

    if (quest.type === QuestType.DAILY && this.didCompleteAllDailies(userId, todayKey())) {
      this.playerService.regenHpForDailyCompletion(userId);
      this.playerService.incrementStreak(userId);
      this.notify.push('[SYSTEM] All Daily Quests complete. Well done, Hunter.', 'info');
    }

    return { ok: true };
  }

  // ----- Admin quest management -----

  createTemplate(template: Omit<QuestTemplate, 'id'>) {
    const withId: QuestTemplate = { ...template, id: crypto.randomUUID() };
    this.saveTemplates([...this.templates(), withId]);
  }

  updateTemplate(template: QuestTemplate) {
    this.saveTemplates(this.templates().map(t => (t.id === template.id ? template : t)));
  }

  deleteTemplate(id: string) {
    this.saveTemplates(this.templates().filter(t => t.id !== id));
  }
}
