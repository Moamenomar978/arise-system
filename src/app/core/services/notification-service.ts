import { Injectable, signal } from '@angular/core';
import { SystemMessage } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private nextId = 1;

  messages = signal<SystemMessage[]>([]);

  // Set by dashboard components that want a full-screen "Level Up!" flash.
  levelUpFlash = signal<{ level: number } | null>(null);
  rankUpFlash = signal<{ rank: string } | null>(null);

  push(text: string, kind: SystemMessage['kind'] = 'info') {
    const msg: SystemMessage = { id: this.nextId++, text, kind };
    this.messages.update(list => [...list, msg]);

    // auto-dismiss after 5s
    setTimeout(() => this.dismiss(msg.id), 5000);
  }

  dismiss(id: number) {
    this.messages.update(list => list.filter(m => m.id !== id));
  }

  triggerLevelUp(level: number) {
    this.push(`[SYSTEM] Level Up! You are now Level ${level}!`, 'success');
    this.levelUpFlash.set({ level });
    setTimeout(() => this.levelUpFlash.set(null), 2200);
  }

  triggerRankUp(rank: string) {
    this.push(`[SYSTEM] Rank Up! You are now ${rank}-Rank Hunter!`, 'success');
    this.rankUpFlash.set({ rank });
    setTimeout(() => this.rankUpFlash.set(null), 2200);
  }
}
