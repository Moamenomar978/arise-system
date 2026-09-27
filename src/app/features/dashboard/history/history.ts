import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth-service';
import { QuestService } from '../../../core/services/quest-service';

@Component({
  imports: [DatePipe],
  selector: 'app-history',
  styleUrl: './history.css',
  templateUrl: './history.html',
})
export class History {
  private auth = inject(AuthService);
  private questService = inject(QuestService);

  entries = computed(() => {
    this.questService.log();
    const u = this.auth.currentUser();
    return u ? this.questService.userLog(u.id) : [];
  });
}
