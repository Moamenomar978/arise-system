import { Component, input } from '@angular/core';
import { Rank } from '../../../core/models/enums';

@Component({
  imports: [],
  selector: 'app-rank-badge',
  styleUrl: './rank-badge.css',
  templateUrl: './rank-badge.html',
})
export class RankBadge {
  rank = input<Rank>(Rank.E);
  size = input<'sm' | 'md' | 'lg'>('md');
}
