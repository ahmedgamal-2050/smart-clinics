import { Component, inject, input, output } from '@angular/core';
import { SidebarItem } from './sidebar.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly sidebarItems = input<SidebarItem[]>([]);
  readonly sidebarCollapsed = input<boolean>(true);
  readonly mobileMenuOpen = input<boolean>(false);
  readonly updateSidebarItems = output<SidebarItem[]>();
  readonly toggleDesktopSidebar = output<boolean>();
  readonly toggleMobileMenu = output<boolean>();
  readonly updateCurrentRoute = output<string>();

  private readonly router = inject(Router);

  getSidebarTooltip(item: SidebarItem): string {
    return this.sidebarCollapsed() ? item.label : '';
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
    this.updateCurrentRoute.emit(route);

    // Update active state
    this.updateSidebarItems.emit(
      this.sidebarItems().map(item => ({
        ...item,
        isActive: item.route === route,
      }))
    );
  }

  closeMobileMenu(): void {
    this.toggleMobileMenu.emit(false);
  }
}
