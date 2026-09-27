import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { PlayerService } from '../../../core/services/player-service';
import { STAT_LABELS, StatType } from '../../../core/models/enums';
import { StatBar } from '../../../shared/components/stat-bar/stat-bar';

@Component({
  imports: [StatBar],
  selector: 'app-stat-allocation',
  styleUrl: './stat-allocation.css',
  templateUrl: './stat-allocation.html',
})
export class StatAllocation {
  private auth = inject(AuthService);
  private playerService = inject(PlayerService);

  statLabels = STAT_LABELS;
  statKeys = Object.values(StatType);

  private userId = computed(() => this.auth.currentUser()?.id ?? null);

  player = computed(() => {
    this.playerService.players();
    const uid = this.userId();
    return uid ? this.playerService.getPlayer(uid) : null;
  });

  allocate(stat: StatType) {
    const uid = this.userId();
    if (!uid) return;
    this.playerService.allocateStat(uid, stat, 1);
  }
}
