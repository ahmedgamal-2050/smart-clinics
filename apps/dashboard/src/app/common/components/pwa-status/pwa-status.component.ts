import { Component, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-status',
  imports: [],
  templateUrl: './pwa-status.component.html',
  styleUrls: ['./pwa-status.component.scss'],
})
export class PwaStatusComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly pwaService = inject(PwaService);

  isOnline = true;
  updateAvailable = false;
  installable = false;
  updating = false;
  installing = false;

  constructor() {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    this.pwaService.isOnline$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
      });

    this.pwaService.updateAvailable$
      .pipe(takeUntil(this.destroy$))
      .subscribe(available => {
        this.updateAvailable = available;
      });

    this.pwaService.installable$
      .pipe(takeUntil(this.destroy$))
      .subscribe(installable => {
        this.installable = installable;
      });
  }

  async updateApp(): Promise<void> {
    this.updating = true;
    try {
      await this.pwaService.updateApplication();
    } catch (error) {
      console.error('Failed to update app:', error);
    } finally {
      this.updating = false;
    }
  }

  async installApp(): Promise<void> {
    this.installing = true;
    try {
      const installed = await this.pwaService.installPwa();
      if (installed) {
        console.log('PWA installed successfully');
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
    } finally {
      this.installing = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
