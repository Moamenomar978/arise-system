import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { QuestService } from '../../../core/services/quest-service';
import { QuestCard } from '../../../shared/components/quest-card/quest-card';

@Component({
  imports: [QuestCard],
  selector: 'app-daily-quests',
  styleUrl: './daily-quests.css',
  templateUrl: './daily-quests.html',
})
export class DailyQuests {
  private auth = inject(AuthService);
  private questService = inject(QuestService);

  // depends on questService.log signal so it recomputes after completions
  quests = computed(() => {
    this.questService.log();
    const u = this.auth.currentUser();
    return u ? this.questService.todaysDailyQuests(u.id) : [];
  });

  completedCount = computed(() => this.quests().filter(q => q.completed).length);

  complete(questId: string) {
    const u = this.auth.currentUser();
    if (!u) return;
    this.questService.completeQuest(u.id, questId);
  }
}
