import {
  Component,
  input,
  signal,
  computed,
  effect,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';

export interface CarouselImage {
  id: number;
  image: {
    url: string;
  };
  alt?: string;
  title?: string;
}

export interface CarouselConfig {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  enableKeyboardNavigation?: boolean;
  pauseOnHover?: boolean;
}

@Component({
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
})
export class CarouselComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  // Input signals
  images = input<CarouselImage[]>([]);
  config = input<CarouselConfig>({
    autoPlay: true,
    autoPlayInterval: 5000,
    showIndicators: true,
    showNavigation: true,
    enableKeyboardNavigation: true,
    pauseOnHover: true,
  });

  // Internal state signals
  readonly currentIndex = signal(0);
  private readonly isPlaying = signal(false);
  private readonly isPaused = signal(false);
  private intervalId: number | null = null;

  // Computed signals
  readonly currentImage = computed(() => {
    const imagesList = this.images();
    const index = this.currentIndex();
    return imagesList[index] || null;
  });

  readonly hasImages = computed(() => this.images().length > 0);
  readonly hasMultipleImages = computed(() => this.images().length > 1);
  readonly isFirstImage = computed(() => this.currentIndex() === 0);
  readonly isLastImage = computed(
    () => this.currentIndex() === this.images().length - 1
  );

  constructor() {
    // Auto-play effect
    effect(() => {
      if (
        this.config().autoPlay &&
        this.hasMultipleImages() &&
        !this.isPaused()
      ) {
        this.startAutoPlay();
      } else {
        this.stopAutoPlay();
      }
    });

    // Keyboard navigation effect
    effect(() => {
      if (this.config().enableKeyboardNavigation) {
        this.setupKeyboardNavigation();
      }
    });

    // Initialize auto-play
    if (this.config().autoPlay) {
      this.isPlaying.set(true);
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.removeKeyboardNavigation();
  }

  // Navigation methods
  goToNext(): void {
    if (!this.hasMultipleImages()) return;

    const nextIndex = this.isLastImage() ? 0 : this.currentIndex() + 1;
    this.currentIndex.set(nextIndex);
  }

  goToPrevious(): void {
    if (!this.hasMultipleImages()) return;

    const prevIndex = this.isFirstImage()
      ? this.images().length - 1
      : this.currentIndex() - 1;
    this.currentIndex.set(prevIndex);
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.images().length) {
      this.currentIndex.set(index);
    }
  }

  // Auto-play methods
  private startAutoPlay(): void {
    this.stopAutoPlay();
    this.intervalId =
      this.document.defaultView?.setInterval(() => {
        this.goToNext();
      }, this.config().autoPlayInterval || 5000) ?? null;
  }

  private stopAutoPlay(): void {
    if (this.intervalId) {
      this.document.defaultView?.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Pause/Resume methods
  onMouseEnter(): void {
    if (this.config().pauseOnHover) {
      this.isPaused.set(true);
    }
  }

  onMouseLeave(): void {
    if (this.config().pauseOnHover) {
      this.isPaused.set(false);
    }
  }

  // Keyboard navigation
  private keyboardHandler = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.goToNext();
        break;
      case ' ':
        event.preventDefault();
        this.isPaused.update(paused => !paused);
        break;
    }
  };

  private setupKeyboardNavigation(): void {
    this.document.addEventListener('keydown', this.keyboardHandler);
  }

  private removeKeyboardNavigation(): void {
    this.document.removeEventListener('keydown', this.keyboardHandler);
  }

  // Accessibility methods
  getSlideAriaLabel(index: number): string {
    const image = this.images()[index];
    return image?.alt || `Slide ${index + 1} of ${this.images().length}`;
  }

  getIndicatorAriaLabel(index: number): string {
    return `Go to slide ${index + 1}`;
  }
}
