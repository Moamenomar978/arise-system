import { Injectable, inject, signal } from '@angular/core';
import { ShopItem } from '../models/models';
import { PlayerService } from './player-service';
import { NotificationService } from './notification-service';

const SHOP_KEY = 'arise_shop_items';

@Injectable({ providedIn: 'root' })
export class ShopService {

  private playerService = inject(PlayerService);
  private notify = inject(NotificationService);

  items = signal<ShopItem[]>(this.load());

  private load(): ShopItem[] {
    const raw = localStorage.getItem(SHOP_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private save(items: ShopItem[]) {
    localStorage.setItem(SHOP_KEY, JSON.stringify(items));
    this.items.set(items);
  }

  itemsForUser(userId: string): ShopItem[] {
    return this.items().filter(i => i.createdBy === userId);
  }

  addItem(userId: string, name: string, description: string, cost: number) {
    const item: ShopItem = { id: crypto.randomUUID(), name, description, cost, createdBy: userId };
    this.save([...this.items(), item]);
  }

  removeItem(id: string) {
    this.save(this.items().filter(i => i.id !== id));
  }

  redeem(userId: string, itemId: string): { ok: boolean; error?: string } {
    const item = this.items().find(i => i.id === itemId);
    if (!item) return { ok: false, error: 'Reward not found.' };

    const spent = this.playerService.spendGold(userId, item.cost);
    if (!spent) return { ok: false, error: 'Not enough gold.' };

    this.notify.push(`[SYSTEM] Reward redeemed: "${item.name}"`, 'success');
    return { ok: true };
  }
}
