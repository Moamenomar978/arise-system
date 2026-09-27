import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../../../core/services/quest-service';
import { AuthService } from '../../../core/services/auth-service';
import { QuestTemplate } from '../../../core/models/models';
import { QuestType, Rank, StatType, STAT_LABELS } from '../../../core/models/enums';

@Component({
  imports: [FormsModule],
  selector: 'app-quest-management',
  styleUrl: './quest-management.css',
  templateUrl: './quest-management.html',
})
export class QuestManagement {
  questService = inject(QuestService);
  private auth = inject(AuthService);

  QuestType = QuestType;
  Rank = Rank;
  StatType = StatType;
  statLabels = STAT_LABELS;

  questTypes = Object.values(QuestType);
  ranks = Object.values(Rank);
  statTypes = Object.values(StatType);

  showForm = signal(false);
  editingId = signal<string | null>(null);

  form = this.emptyForm();

  private emptyForm() {
    return {
      title: '',
      description: '',
      type: QuestType.DAILY,
      category: StatType.STRENGTH,
      xpReward: 20,
      goldReward: 10,
      statPointReward: 0,
      difficulty: Rank.E,
      isRepeatable: true,
      active: true,
    };
  }

  startCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(q: QuestTemplate) {
    this.form = { ...q, statPointReward: q.statPointReward ?? 0 };
    this.editingId.set(q.id);
    this.showForm.set(true);
  }

  save() {
    if (!this.form.title.trim()) return;
    const adminId = this.auth.currentUser()?.id ?? 'SYSTEM';

    const editing = this.editingId();
    if (editing) {
      const existing = this.questService.templates().find(t => t.id === editing);
      if (!existing) return;
      this.questService.updateTemplate({ ...existing, ...this.form });
    } else {
      this.questService.createTemplate({ ...this.form, createdBy: adminId });
    }

    this.showForm.set(false);
    this.editingId.set(null);
  }

  toggleActive(q: QuestTemplate) {
    this.questService.updateTemplate({ ...q, active: !q.active });
  }

  remove(id: string) {
    if (!confirm('Delete this quest template? Existing history entries are kept.')) return;
    this.questService.deleteTemplate(id);
  }
}
