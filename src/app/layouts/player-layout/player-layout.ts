import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { PlayerService } from '../../core/services/player-service';
import { QuestService } from '../../core/services/quest-service';
import { RankBadge } from '../../shared/components/rank-badge/rank-badge';
import { StatBar } from '../../shared/components/stat-bar/stat-bar';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RankBadge, StatBar],
  selector: 'app-player-layout',
  styleUrl: './player-layout.css',
  templateUrl: './player-layout.html',
})
export class PlayerLayout implements OnInit {
  auth = inject(AuthService);
  playerService = inject(PlayerService);
  questService = inject(QuestService);
  private router = inject(Router);

  user = this.auth.currentUser;

  player = computed(() => {
    const u = this.user();
    return u ? this.playerService.getPlayer(u.id) : null;
  });

  ngOnInit() {
    const u = this.user();
    if (!u) return;

    // Check whether *yesterday's* dailies were all completed before today's
    // penalty check runs, using the log we already have.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const completedYesterday = this.questService.didCompleteAllDailies(u.id, yKey);

    this.playerService.checkDailyPenalty(u.id, completedYesterday);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
