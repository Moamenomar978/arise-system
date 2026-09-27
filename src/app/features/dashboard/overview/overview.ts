import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { PlayerService } from '../../../core/services/player-service';
import { AnnouncementService } from '../../../core/services/announcement-service';
import { XpRing } from '../../../shared/components/xp-ring/xp-ring';
import { StatBar } from '../../../shared/components/stat-bar/stat-bar';
import { RankBadge } from '../../../shared/components/rank-badge/rank-badge';
import { STAT_LABELS, StatType } from '../../../core/models/enums';

@Component({
  imports: [XpRing, StatBar, RankBadge],
  selector: 'app-overview',
  styleUrl: './overview.css',
  templateUrl: './overview.html',
})
export class Overview {
  private auth = inject(AuthService);
  private playerService = inject(PlayerService);
  announcementService = inject(AnnouncementService);

  statLabels = STAT_LABELS;
  statKeys = Object.values(StatType);

  player = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.playerService.getPlayer(u.id) : null;
  });

  user = this.auth.currentUser;

  maxStatValue = computed(() => {
    const p = this.player();
    if (!p) return 1;
    return Math.max(...Object.values(p.stats), 1);
  });
}
