import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-accordion',
  imports: [],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  accordionId = input.required<string>();
  accordionTitle = input.required<string>();
  isItemExpanded = model<boolean>(false);
}
