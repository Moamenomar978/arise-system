import { Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-xp-ring',
  styleUrl: './xp-ring.css',
  templateUrl: './xp-ring.html',
})
export class XpRing {
  level = input<number>(1);
  currentXP = input<number>(0);
  xpToNextLevel = input<number>(100);

  radius = 54;
  circumference = 2 * Math.PI * this.radius;

  percent = computed(() => {
    const max = this.xpToNextLevel() || 1;
    return Math.max(0, Math.min(1, this.currentXP() / max));
  });

  dashOffset = computed(() => this.circumference * (1 - this.percent()));
}
