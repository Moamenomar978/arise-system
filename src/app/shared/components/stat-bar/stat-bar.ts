import { Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-stat-bar',
  styleUrl: './stat-bar.css',
  templateUrl: './stat-bar.html',
})
export class StatBar {
  label = input<string>('');
  value = input<number>(0);
  max = input<number>(100);
  variant = input<'xp' | 'hp' | 'default'>('default');
  showNumbers = input<boolean>(true);

  percent = computed(() => {
    const max = this.max() || 1;
    return Math.max(0, Math.min(100, (this.value() / max) * 100));
  });
}
