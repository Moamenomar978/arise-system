import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { QuestService } from '../../../core/services/quest-service';
import { QuestCard } from '../../../shared/components/quest-card/quest-card';
import { QuestType } from '../../../core/models/enums';

@Component({
  imports: [QuestCard],
  selector: 'app-quest-board',
  styleUrl: './quest-board.css',
  templateUrl: './quest-board.html',
})
export class QuestBoard {
  private auth = inject(AuthService);
  private questService = inject(QuestService);

  QuestType = QuestType;

  private userId = computed(() => this.auth.currentUser()?.id ?? null);

  weekly = computed(() => this.withStatus(QuestType.WEEKLY));
  special = computed(() => this.withStatus(QuestType.SPECIAL));
  story = computed(() => this.withStatus(QuestType.STORY));

  private withStatus(type: QuestType) {
    this.questService.log(); // dependency for recompute
    const uid = this.userId();
    if (!uid) return [];
    return this.questService.activeTemplatesByType(type).map(q => ({
      ...q,
      completed: q.isRepeatable
        ? false // repeatable non-dailies can always be attempted again here
        : this.questService.isCompletedEver(uid, q.id),
    }));
  }

  complete(questId: string) {
    const uid = this.userId();
    if (!uid) return;
    this.questService.completeQuest(uid, questId);
  }
}
