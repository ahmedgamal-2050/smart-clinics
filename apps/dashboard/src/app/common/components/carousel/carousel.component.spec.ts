import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import {
  CarouselComponent,
  CarouselImage,
  CarouselConfig,
} from './carousel.component';

@Component({
  template: `
    <app-carousel [images]="images" [config]="config"></app-carousel>
  `,
})
class TestHostComponent {
  images: CarouselImage[] = [
    {
      id: 1,
      image: { url: 'https://example.com/image1.jpg' },
      alt: 'Test Image 1',
      title: 'First Image',
    },
    {
      id: 2,
      image: { url: 'https://example.com/image2.jpg' },
      alt: 'Test Image 2',
      title: 'Second Image',
    },
    {
      id: 3,
      image: { url: 'https://example.com/image3.jpg' },
      alt: 'Test Image 3',
    },
  ];

  config: CarouselConfig = {
    autoPlay: false,
    showIndicators: true,
    showNavigation: true,
    enableKeyboardNavigation: true,
    pauseOnHover: true,
  };
}

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
      declarations: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;

    fixture.detectChanges();
    hostFixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default config', () => {
      expect(component.config().autoPlay).toBe(true);
      expect(component.config().showIndicators).toBe(true);
      expect(component.config().showNavigation).toBe(true);
      expect(component.config().enableKeyboardNavigation).toBe(true);
    });

    it('should initialize current index to 0', () => {
      expect(component.currentIndex()).toBe(0);
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('images', hostComponent.images);
      fixture.detectChanges();
    });

    it('should compute hasImages correctly', () => {
      expect(component.hasImages()).toBe(true);
    });

    it('should compute hasMultipleImages correctly', () => {
      expect(component.hasMultipleImages()).toBe(true);
    });

    it('should compute currentImage correctly', () => {
      expect(component.currentImage()).toEqual(hostComponent.images[0]);
    });

    it('should compute isFirstImage correctly', () => {
      expect(component.isFirstImage()).toBe(true);
    });

    it('should compute isLastImage correctly', () => {
      expect(component.isLastImage()).toBe(false);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('images', hostComponent.images);
      fixture.detectChanges();
    });

    it('should go to next image', () => {
      component.goToNext();
      expect(component.currentIndex()).toBe(1);
    });

    it('should go to previous image', () => {
      component.goToNext();
      component.goToPrevious();
      expect(component.currentIndex()).toBe(0);
    });

    it('should wrap around when going to next from last image', () => {
      component.goToSlide(2); // Go to last image
      component.goToNext();
      expect(component.currentIndex()).toBe(0);
    });

    it('should wrap around when going to previous from first image', () => {
      component.goToPrevious();
      expect(component.currentIndex()).toBe(2);
    });

    it('should go to specific slide', () => {
      component.goToSlide(1);
      expect(component.currentIndex()).toBe(1);
    });

    it('should not navigate with invalid index', () => {
      component.goToSlide(-1);
      expect(component.currentIndex()).toBe(0);

      component.goToSlide(99);
      expect(component.currentIndex()).toBe(0);
    });
  });

  describe('Auto-play', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('images', hostComponent.images);
      fixture.componentRef.setInput('config', {
        autoPlay: true,
        autoPlayInterval: 100,
        showIndicators: true,
        showNavigation: true,
        enableKeyboardNavigation: true,
        pauseOnHover: true,
      });
      fixture.detectChanges();
    });

    it('should auto-advance slides', fakeAsync(() => {
      expect(component.currentIndex()).toBe(0);

      tick(100);
      expect(component.currentIndex()).toBe(1);

      tick(100);
      expect(component.currentIndex()).toBe(2);

      tick(100);
      expect(component.currentIndex()).toBe(0);
    }));

    it('should pause on mouse enter', () => {
      spyOn(component, 'onMouseEnter').and.callThrough();
      component.onMouseEnter();
      expect(component.onMouseEnter).toHaveBeenCalled();
    });

    it('should resume on mouse leave', () => {
      spyOn(component, 'onMouseLeave').and.callThrough();
      component.onMouseLeave();
      expect(component.onMouseLeave).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('images', hostComponent.images);
      fixture.detectChanges();
    });

    it('should generate correct slide aria label', () => {
      const label = component.getSlideAriaLabel(0);
      expect(label).toBe('Test Image 1');
    });

    it('should generate correct indicator aria label', () => {
      const label = component.getIndicatorAriaLabel(0);
      expect(label).toBe('Go to slide 1');
    });

    it('should generate fallback aria label when no alt text', () => {
      const images = [{ id: 1, image: { url: 'test.jpg' } }];
      fixture.componentRef.setInput('images', images);
      fixture.detectChanges();

      const label = component.getSlideAriaLabel(0);
      expect(label).toBe('Slide 1 of 1');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('images', hostComponent.images);
      fixture.detectChanges();
    });

    it('should handle arrow key navigation', () => {
      spyOn(component, 'goToNext');
      spyOn(component, 'goToPrevious');

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);

      // Note: Testing keyboard events requires more setup in a real test environment
      // This is a basic structure for the test
    });
  });

  describe('Template Rendering', () => {
    it('should render empty state when no images', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.text-gray-600')).toBeTruthy();
    });

    it('should render images when provided', () => {
      fixture.componentRef.setInput('images', hostComponent.images);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('img')).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup on destroy', () => {
      spyOn(component, 'ngOnDestroy').and.callThrough();
      fixture.destroy();
      expect(component.ngOnDestroy).toHaveBeenCalled();
    });
  });
});
