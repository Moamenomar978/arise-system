import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { PlayerService } from '../../../core/services/player-service';
import { ShopService } from '../../../core/services/shop-service';

@Component({
  imports: [FormsModule],
  selector: 'app-shop',
  styleUrl: './shop.css',
  templateUrl: './shop.html',
})
export class Shop {
  private auth = inject(AuthService);
  private playerService = inject(PlayerService);
  private shopService = inject(ShopService);

  private userId = computed(() => this.auth.currentUser()?.id ?? '');

  player = computed(() => {
    this.playerService.players();
    return this.playerService.getPlayer(this.userId());
  });

  items = computed(() => {
    this.shopService.items();
    return this.shopService.itemsForUser(this.userId());
  });

  showForm = signal(false);
  newName = '';
  newDescription = '';
  newCost: number | null = null;

  addItem() {
    if (!this.newName || !this.newCost || this.newCost <= 0) return;
    this.shopService.addItem(this.userId(), this.newName, this.newDescription, this.newCost);
    this.newName = '';
    this.newDescription = '';
    this.newCost = null;
    this.showForm.set(false);
  }

  redeem(itemId: string) {
    this.shopService.redeem(this.userId(), itemId);
  }

  remove(itemId: string) {
    this.shopService.removeItem(itemId);
  }
}
