import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'min',
  standalone: true,
})
export class MinPipe implements PipeTransform {
  transform(value: number, compareValue: number): number {
    return Math.min(value, compareValue);
  }
}
