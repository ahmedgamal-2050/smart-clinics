import {
  Component,
  inject,
  OnInit,
  signal,
  input,
  output,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { AppStorage } from '../../enums/app-storage';
import { UpperCasePipe, NgIf } from '@angular/common';
import { AppRoutes } from '../../enums/app-routes';
import { User } from '../../../pages/auth/login/login.model';

@Component({
  selector: 'app-top-navbar',
  imports: [UpperCasePipe, NgIf],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.scss',
})
export class TopNavbarComponent implements OnInit {
  private transloco = inject(TranslocoService);
  private router = inject(Router);

  readonly mobileMenuOpen = input<boolean>(false);
  readonly sidebarCollapsed = input<boolean>(true);
  readonly toggleMobileMenu = output<boolean>();
  readonly toggleDesktopSidebar = output<boolean>();

  readonly currentUser = signal<User | null>(null);
  readonly currentLanguage = signal(this.transloco.getActiveLang());
  readonly isDarkMode = signal<boolean>(false);

  ngOnInit(): void {
    this.loadUser();
    this.loadDarkModePreference();
  }

  toggleMobileSidebar(): void {
    this.toggleMobileMenu.emit(!this.mobileMenuOpen());
  }

  closeMobileSidebar(): void {
    this.toggleMobileMenu.emit(false);
  }

  toggleSidebar(): void {
    this.toggleDesktopSidebar.emit(!this.sidebarCollapsed());
  }

  loadUser(): void {
    // Load user data from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.currentUser.set(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

  loadDarkModePreference(): void {
    // Check localStorage for dark mode preference
    const darkModePreference = localStorage.getItem(AppStorage.darkMode);

    if (darkModePreference !== null) {
      const isDark = darkModePreference === 'true';
      this.isDarkMode.set(isDark);
      this.applyDarkMode(isDark);
    } else {
      // Check system preference if no user preference is stored
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.isDarkMode.set(systemPrefersDark);
      this.applyDarkMode(systemPrefersDark);
    }
  }

  toggleDarkMode(): void {
    const newDarkMode = !this.isDarkMode();
    this.isDarkMode.set(newDarkMode);
    this.applyDarkMode(newDarkMode);
    localStorage.setItem(AppStorage.darkMode, newDarkMode.toString());
  }

  private applyDarkMode(isDark: boolean): void {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  switchLanguage(): void {
    const lang = this.currentLanguage() === 'en' ? 'ar' : 'en';
    this.currentLanguage.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem(AppStorage.language, lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    location.reload();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user?.name) return 'U';

    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate([AppRoutes.Login]);
  }
}
