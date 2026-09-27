import { Component, input, output } from '@angular/core';
import { QuestTemplate } from '../../../core/models/models';
import { RankBadge } from '../rank-badge/rank-badge';
import { STAT_LABELS } from '../../../core/models/enums';

@Component({
  imports: [RankBadge],
  selector: 'app-quest-card',
  styleUrl: './quest-card.css',
  templateUrl: './quest-card.html',
})
export class QuestCard {
  quest = input.required<QuestTemplate>();
  completed = input<boolean>(false);
  complete = output<void>();

  statLabels = STAT_LABELS;
}
