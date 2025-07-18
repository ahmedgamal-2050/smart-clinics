import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionComponent, AccordionItem } from './accordion.component';

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;

  const mockItems: AccordionItem[] = [
    {
      id: '1',
      title: 'What is David UI?',
      content:
        'David UI is a comprehensive UI library built with Tailwind CSS, offering modern and customizable components for web development.',
    },
    {
      id: '2',
      title: 'How to use David UI?',
      content:
        'You can install David UI via npm and import the components you need in your Angular application.',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all accordion items', () => {
    const accordionItems = fixture.nativeElement.querySelectorAll('.group');
    expect(accordionItems.length).toBe(2);
  });

  it('should toggle item expansion when clicked', () => {
    const firstButton = fixture.nativeElement.querySelector('button');
    firstButton.click();
    fixture.detectChanges();

    expect(component.isExpanded('1')).toBe(true);
  });

  it('should close other items when allowMultiple is false', () => {
    fixture.componentRef.setInput('allowMultiple', false);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();
    fixture.detectChanges();

    expect(component.isExpanded('1')).toBe(false);
    expect(component.isExpanded('2')).toBe(true);
  });
});
