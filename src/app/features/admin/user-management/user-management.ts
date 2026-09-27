import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { PlayerService } from '../../../core/services/player-service';
import { RankBadge } from '../../../shared/components/rank-badge/rank-badge';
import { Role } from '../../../core/models/enums';
import { AppUser } from '../../../core/models/models';

@Component({
  imports: [RankBadge],
  selector: 'app-user-management',
  styleUrl: './user-management.css',
  templateUrl: './user-management.html',
})
export class UserManagement {
  private auth = inject(AuthService);
  private playerService = inject(PlayerService);

  Role = Role;
  currentAdminId = computed(() => this.auth.currentUser()?.id);

  private refreshTick = signal(0);

  users = computed(() => {
    this.refreshTick();
    this.playerService.players();
    return this.auth.getUsers();
  });

  private refresh() {
    this.refreshTick.update(n => n + 1);
  }

  playerFor(userId: string) {
    return this.playerService.getPlayer(userId);
  }

  toggleBan(user: AppUser) {
    this.auth.updateUser({ ...user, banned: !user.banned });
    this.refresh();
  }

  toggleRole(user: AppUser) {
    const newRole = user.role === Role.ADMIN ? Role.USER : Role.ADMIN;
    this.auth.updateUser({ ...user, role: newRole });
    this.refresh();
  }

  resetProgress(userId: string) {
    if (!confirm('Reset this hunter\'s level, stats, and gold back to the start?')) return;
    this.playerService.resetPlayer(userId);
  }

  deleteUser(userId: string) {
    if (!confirm('Permanently delete this hunter account? This cannot be undone.')) return;
    this.auth.deleteUser(userId);
    this.refresh();
  }
}
