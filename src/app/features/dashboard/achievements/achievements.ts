import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { PlayerService } from '../../../core/services/player-service';

interface MilestoneTitle {
  title: string;
  description: string;
  check: (level: number, streak: number, totalQuests: number) => boolean;
}

@Component({
  imports: [],
  selector: 'app-achievements',
  styleUrl: './achievements.css',
  templateUrl: './achievements.html',
})
export class Achievements {
  private auth = inject(AuthService);
  private playerService = inject(PlayerService);

  private userId = computed(() => this.auth.currentUser()?.id ?? null);

  player = computed(() => {
    this.playerService.players();
    const uid = this.userId();
    return uid ? this.playerService.getPlayer(uid) : null;
  });

  milestones: MilestoneTitle[] = [
    { title: 'First Steps', description: 'Reach Level 5', check: (lvl) => lvl >= 5 },
    { title: 'Iron Will', description: 'Reach a 30-day streak', check: (_l, streak) => streak >= 30 },
    { title: 'Scholar', description: 'Reach Level 25', check: (lvl) => lvl >= 25 },
    { title: 'Shadow Monarch', description: 'Reach S-Rank (Level 121+)', check: (lvl) => lvl >= 121 },
  ];

  earned(m: MilestoneTitle): boolean {
    const p = this.player();
    if (!p) return false;
    return m.check(p.level, p.streak, 0) || p.titles.includes(m.title);
  }
}
