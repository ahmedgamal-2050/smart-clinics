import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { signal } from '@angular/core';

import { DashboardComponent, SidebarItem } from './dashboard.component';
import { AppRoutes } from '../../../common/enums/app-routes';
import { User } from '../../auth/login/login.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockRouter: any;
  let mockTransloco: any;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/dashboard',
    });
    const translocoSpy = jasmine.createSpyObj('TranslocoService', [
      'translate',
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslocoModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockTransloco = TestBed.inject(
      TranslocoService
    ) as jasmine.SpyObj<TranslocoService>;

    // Setup default translations
    mockTransloco.translate.and.callFake((key: string) => {
      const translations: Record<string, string> = {
        'dashboard.menu.dashboard': 'Dashboard',
        'dashboard.menu.patients': 'Patients',
        'dashboard.menu.appointments': 'Appointments',
        'dashboard.menu.doctors': 'Doctors',
        'dashboard.menu.reports': 'Reports',
        'dashboard.menu.billing': 'Billing',
        'dashboard.menu.analytics': 'Analytics',
        'dashboard.menu.settings': 'Settings',
        'dashboard.title': 'Dashboard',
        'dashboard.subtitle': 'Welcome to Smart Clinics Dashboard',
      };
      return translations[key] || key;
    });
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default state', () => {
      expect(component.sidebarCollapsed()).toBe(true);
      expect(component.mobileMenuOpen()).toBe(false);
      expect(component.currentUser()).toBeNull();
    });

    it('should initialize sidebar items on ngOnInit', () => {
      component.ngOnInit();

      const sidebarItems = component.sidebarItems();
      expect(sidebarItems.length).toBeGreaterThan(0);
      expect(sidebarItems[0].id).toBe('dashboard');
      expect(sidebarItems[0].isActive).toBe(true);
    });

    it('should set current route on initialization', () => {
      component.ngOnInit();

      expect(component.currentRoute()).toBe('/dashboard');
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
      spyOn(localStorage, 'setItem');
      spyOn(localStorage, 'removeItem');
    });

    it('should load user data from localStorage', () => {
      component.ngOnInit();

      expect(localStorage.getItem).toHaveBeenCalledWith('user');
      expect(component.currentUser()).toEqual(mockUser);
    });

    it('should handle invalid user data gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid-json');
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
      expect(component.currentUser()).toBeNull();
    });

    it('should generate correct user initials', () => {
      component.currentUser.set(mockUser);

      expect(component.getUserInitials()).toBe('TU');
    });

    it('should handle single name for initials', () => {
      component.currentUser.set({ ...mockUser, name: 'John' });

      expect(component.getUserInitials()).toBe('J');
    });

    it('should return default initial when no user', () => {
      component.currentUser.set(null);

      expect(component.getUserInitials()).toBe('U');
    });
  });

  describe('Sidebar Management', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should toggle sidebar collapsed state', () => {
      expect(component.sidebarCollapsed()).toBe(true);

      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(false);

      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(true);
    });

    it('should return tooltip text when sidebar is collapsed', () => {
      const mockItem: SidebarItem = {
        id: 'test',
        label: 'Test Item',
        icon: 'test-icon',
        route: 'test-route',
      };

      component.sidebarCollapsed.set(true);
      expect(component.getSidebarTooltip(mockItem)).toBe('Test Item');

      component.sidebarCollapsed.set(false);
      expect(component.getSidebarTooltip(mockItem)).toBe('');
    });

    it('should have correct sidebar items configuration', () => {
      const sidebarItems = component.sidebarItems();

      expect(sidebarItems.some(item => item.id === 'dashboard')).toBe(true);
      expect(sidebarItems.some(item => item.id === 'patients')).toBe(true);
      expect(sidebarItems.some(item => item.id === 'appointments')).toBe(true);
      expect(sidebarItems.some(item => item.badge)).toBe(true);
    });
  });

  describe('Mobile Menu Management', () => {
    it('should toggle mobile menu state', () => {
      expect(component.mobileMenuOpen()).toBe(false);

      component.toggleMobileMenu();
      expect(component.mobileMenuOpen()).toBe(true);

      component.toggleMobileMenu();
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should close mobile menu', () => {
      component.mobileMenuOpen.set(true);

      component.closeMobileMenu();
      expect(component.mobileMenuOpen()).toBe(false);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should navigate to route and update state', () => {
      const testRoute = AppRoutes.Patients;

      component.navigateToRoute(testRoute);

      expect(mockRouter.navigate).toHaveBeenCalledWith([testRoute]);
      expect(component.currentRoute()).toBe(testRoute);
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should update active state when navigating', () => {
      const testRoute = AppRoutes.Patients;

      component.navigateToRoute(testRoute);

      const sidebarItems = component.sidebarItems();
      const activeItem = sidebarItems.find(item => item.route === testRoute);
      const previouslyActiveItem = sidebarItems.find(
        item => item.route === AppRoutes.Dashboard
      );

      expect(activeItem?.isActive).toBe(true);
      expect(previouslyActiveItem?.isActive).toBe(false);
    });

    it('should get current active route', () => {
      const testRoute = AppRoutes.Settings;
      component.currentRoute.set(testRoute);

      expect(component.getActiveRoute()).toBe(testRoute);
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      spyOn(localStorage, 'removeItem');
      component.currentUser.set(mockUser);
    });

    it('should clear user data and navigate to login', () => {
      component.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(component.currentUser()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoutes.Login]);
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should render navigation bar', () => {
      const navbar = fixture.debugElement.nativeElement.querySelector('nav');
      expect(navbar).toBeTruthy();
    });

    it('should render Smart Clinics logo', () => {
      const logo = fixture.debugElement.nativeElement.querySelector('h1');
      expect(logo.textContent).toContain('Smart Clinics');
    });

    it('should render sidebar items', () => {
      const sidebarItems = fixture.debugElement.nativeElement.querySelectorAll(
        '.sidebar-item, button[type="button"]'
      );
      expect(sidebarItems.length).toBeGreaterThan(0);
    });

    it('should display user initials in profile button', () => {
      component.currentUser.set(mockUser);
      fixture.detectChanges();

      const profileButton =
        fixture.debugElement.nativeElement.querySelector('.bg-blue-600 span');
      expect(profileButton.textContent.trim()).toBe('TU');
    });

    it('should show/hide mobile menu based on state', () => {
      // Initially hidden
      let mobileMenu = fixture.debugElement.nativeElement.querySelector(
        '.fixed.inset-0.flex.z-40'
      );
      expect(mobileMenu).toBeFalsy();

      // Show mobile menu
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      mobileMenu = fixture.debugElement.nativeElement.querySelector(
        '.fixed.inset-0.flex.z-40'
      );
      expect(mobileMenu).toBeTruthy();
    });

    it('should apply correct classes based on sidebar state', () => {
      const sidebarElement = fixture.debugElement.nativeElement.querySelector(
        '.sidebar-transition, .flex.flex-col'
      );

      component.sidebarCollapsed.set(true);
      fixture.detectChanges();

      // Check if collapsed width class is applied
      expect(sidebarElement.className).toContain('w-16');

      component.sidebarCollapsed.set(false);
      fixture.detectChanges();

      // Check if expanded width class is applied
      expect(sidebarElement.className).toContain('w-64');
    });

    it('should handle click events on sidebar items', () => {
      spyOn(component, 'navigateToRoute');

      const sidebarButton = fixture.debugElement.nativeElement.querySelector(
        'button[type="button"]'
      );
      sidebarButton.click();

      expect(component.navigateToRoute).toHaveBeenCalled();
    });

    it('should handle mobile menu toggle', () => {
      spyOn(component, 'toggleMobileMenu');

      const mobileToggle =
        fixture.debugElement.nativeElement.querySelector('.lg\\:hidden');
      mobileToggle.click();

      expect(component.toggleMobileMenu).toHaveBeenCalled();
    });

    it('should handle logout button click', () => {
      spyOn(component, 'logout');

      const logoutButton = fixture.debugElement.nativeElement.querySelector(
        'button[title="Logout"]'
      );
      logoutButton.click();

      expect(component.logout).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes', () => {
      const buttons =
        fixture.debugElement.nativeElement.querySelectorAll('button');
      buttons.forEach((button: HTMLElement) => {
        expect(button.getAttribute('type')).toBe('button');
      });
    });

    it('should have proper focus management', () => {
      const focusableElements =
        fixture.debugElement.nativeElement.querySelectorAll(
          'button, [tabindex]'
        );
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should have proper keyboard navigation support', () => {
      const overlay =
        fixture.debugElement.nativeElement.querySelector('[tabindex="0"]');
      expect(overlay).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should handle different screen sizes', () => {
      // Test mobile responsiveness
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.sidebarCollapsed()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle translation errors gracefully', () => {
      mockTransloco.translate.and.throwError('Translation error');

      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle navigation errors gracefully', () => {
      mockRouter.navigate.and.returnValue(Promise.reject('Navigation failed'));

      expect(() =>
        component.navigateToRoute(AppRoutes.Dashboard)
      ).not.toThrow();
    });
  });
});
