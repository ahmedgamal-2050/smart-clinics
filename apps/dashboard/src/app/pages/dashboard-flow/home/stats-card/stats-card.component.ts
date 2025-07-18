import { Component, input } from '@angular/core';
import { StatsCard } from './stats-card.model';

@Component({
  selector: 'app-stats-card',
  imports: [],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss',
})
export class StatsCardComponent {
  statsCard = input.required<StatsCard>();
}
