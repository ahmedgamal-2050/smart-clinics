import { Injectable, ApplicationRef, OnDestroy, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { takeUntil, filter, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PwaService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private deferredPrompt: any = null;

  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);

  private readonly isOnlineSubject = new BehaviorSubject<boolean>(
    navigator.onLine
  );
  private readonly updateAvailableSubject = new BehaviorSubject<boolean>(false);
  private readonly installableSubject = new BehaviorSubject<boolean>(false);

  readonly isOnline$ = this.isOnlineSubject.asObservable();
  readonly updateAvailable$ = this.updateAvailableSubject.asObservable();
  readonly installable$ = this.installableSubject.asObservable();

  constructor() {
    this.initializeServiceWorker();
    this.initializeOnlineStatus();
    this.initializeInstallPrompt();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeServiceWorker(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Check for updates every 30 seconds when app is stable
    this.appRef.isStable
      .pipe(
        first(isStable => isStable === true),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        interval(30000)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.swUpdate.checkForUpdate();
          });
      });

    // Handle available updates
    this.swUpdate.versionUpdates
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event.type === 'VERSION_DETECTED')
      )
      .subscribe(() => {
        this.updateAvailableSubject.next(true);
      });

    // Handle update installations
    this.swUpdate.versionUpdates
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event.type === 'VERSION_READY')
      )
      .subscribe(() => {
        this.updateAvailableSubject.next(true);
      });
  }

  private initializeOnlineStatus(): void {
    window.addEventListener('online', () => {
      this.isOnlineSubject.next(true);
    });

    window.addEventListener('offline', () => {
      this.isOnlineSubject.next(false);
    });
  }

  private initializeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', event => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      event.preventDefault();

      // Stash the event so it can be triggered later
      this.deferredPrompt = event;
      this.installableSubject.next(true);
    });

    window.addEventListener('appinstalled', () => {
      this.installableSubject.next(false);
      this.deferredPrompt = null;
    });
  }

  async updateApplication(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    try {
      await this.swUpdate.activateUpdate();
      window.location.reload();
    } catch (error) {
      console.error('Failed to update application:', error);
    }
  }

  async installPwa(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const result = await this.deferredPrompt.userChoice;

      // Reset the deferred prompt
      this.deferredPrompt = null;
      this.installableSubject.next(false);

      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }

  checkForUpdate(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();
    }
  }

  getNetworkStatus(): { online: boolean; effectiveType?: string } {
    const connection = (navigator as any).connection;
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
    };
  }
}
