import { Component, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { StatsCardComponent } from './stats-card/stats-card.component';
import { StatsCard } from './stats-card/stats-card.model';

@Component({
  selector: 'app-home',
  imports: [TranslocoPipe, StatsCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly transloco = inject(TranslocoService);
  readonly statsCards = signal<StatsCard[]>([
    {
      title: this.transloco.translate('dashboard.home.totalPatients'),
      value: '1,234',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      title: this.transloco.translate('dashboard.home.totalAppointments'),
      value: '5,678',
      icon: 'M8 7V3a1 1 0 012 0v4h4V3a1 1 0 112 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2zm4 6a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      title: this.transloco.translate('dashboard.home.totalDoctors'),
      value: '12',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
      title: this.transloco.translate('dashboard.home.monthlyRevenue'),
      value: '$45,678',
      icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z',
    },
  ]);
}
