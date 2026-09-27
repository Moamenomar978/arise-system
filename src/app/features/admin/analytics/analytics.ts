import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { PlayerService } from '../../../core/services/player-service';
import { QuestService } from '../../../core/services/quest-service';
import { QuestType, Rank } from '../../../core/models/enums';

@Component({
  imports: [],
  selector: 'app-analytics',
  styleUrl: './analytics.css',
  templateUrl: './analytics.html',
})
export class Analytics {
  private auth = inject(AuthService);
  private playerService = inject(PlayerService);
  private questService = inject(QuestService);

  ranks = Object.values(Rank);

  totalUsers = computed(() => this.auth.getUsers().length);

  players = computed(() => {
    this.playerService.players();
    return this.playerService.allPlayers();
  });

  avgLevel = computed(() => {
    const list = this.players();
    if (!list.length) return 0;
    return Math.round((list.reduce((sum, p) => sum + p.level, 0) / list.length) * 10) / 10;
  });

  totalQuestsCompleted = computed(() => {
    this.questService.log();
    return this.questService.log().length;
  });

  rankDistribution = computed(() => {
    const list = this.players();
    const counts = Object.fromEntries(this.ranks.map(r => [r, 0])) as Record<Rank, number>;
    for (const p of list) counts[p.rank]++;
    const max = Math.max(1, ...Object.values(counts));
    return this.ranks.map(r => ({ rank: r, count: counts[r], percent: (counts[r] / max) * 100 }));
  });

  dailyCompletionRate = computed(() => {
    const dailies = this.questService.activeTemplatesByType(QuestType.DAILY);
    const users = this.auth.getUsers().filter(u => !u.banned);
    if (!users.length || !dailies.length) return 0;

    let completedSlots = 0;
    const totalSlots = users.length * dailies.length;
    for (const u of users) {
      for (const q of dailies) {
        if (this.questService.isCompletedToday(u.id, q.id)) completedSlots++;
      }
    }
    return totalSlots ? Math.round((completedSlots / totalSlots) * 100) : 0;
  });
}
