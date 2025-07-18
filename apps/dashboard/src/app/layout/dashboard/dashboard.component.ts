import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { AppRoutes } from '../../common/enums/app-routes';
import { TopNavbarComponent } from '../../common/components/top-navbar/top-navbar.component';
import { SidebarItem } from '../../common/components/sidebar/sidebar.model';
import { SidebarComponent } from '../../common/components/sidebar/sidebar.component';
import { StatsCard } from '../../pages/dashboard-flow/home/stats-card/stats-card.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, TopNavbarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  // State management using signals
  readonly sidebarCollapsed = signal(true);
  readonly currentRoute = signal<string>('');
  readonly sidebarItems = signal<SidebarItem[]>([]);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly statsCards = signal<StatsCard[]>([
    {
      title: 'Total Patients',
      value: '1,234',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      title: 'Total Appointments',
      value: '5,678',
      icon: 'M8 7V3a1 1 0 012 0v4h4V3a1 1 0 112 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2zm4 6a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      title: 'Total Doctors',
      value: '12',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
  ]);

  ngOnInit(): void {
    this.initializeDashboard();
  }

  toggleMobileMenu(open: boolean): void {
    this.mobileMenuOpen.set(open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleSidebar(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }

  private initializeDashboard(): void {
    // Initialize sidebar items
    this.sidebarItems.set([
      {
        id: 'home',
        label: this.transloco.translate('dashboard.menu.dashboard'),
        icon: 'M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Home}`,
        isActive: true,
      },
      {
        id: 'patients',
        label: this.transloco.translate('dashboard.menu.patients'),
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Patients}`,
        badge: '12',
        badgeColor: 'bg-blue-500',
      },
      {
        id: 'appointments',
        label: this.transloco.translate('dashboard.menu.appointments'),
        icon: 'M8 7V3a1 1 0 012 0v4h4V3a1 1 0 112 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2zm4 6a2 2 0 11-4 0 2 2 0 014 0z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Appointments}`,
        badge: '5',
        badgeColor: 'bg-green-500',
      },
      {
        id: 'doctors',
        label: this.transloco.translate('dashboard.menu.doctors'),
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Doctors}`,
      },
      {
        id: 'reports',
        label: this.transloco.translate('dashboard.menu.reports'),
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Reports}`,
      },
      {
        id: 'billing',
        label: this.transloco.translate('dashboard.menu.billing'),
        icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Billing}`,
      },
      {
        id: 'analytics',
        label: this.transloco.translate('dashboard.menu.analytics'),
        icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Analytics}`,
      },
      {
        id: 'settings',
        label: this.transloco.translate('dashboard.menu.settings'),
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        route: `/${AppRoutes.Dashboard}/${AppRoutes.Settings}`,
      },
    ]);

    // Set current route
    this.currentRoute.set(this.router.url);
  }

  updateSidebarItems(items: SidebarItem[]): void {
    this.sidebarItems.set(items);
    this.closeMobileMenu();
  }

  getActiveRoute(): string {
    return this.currentRoute();
  }
}
