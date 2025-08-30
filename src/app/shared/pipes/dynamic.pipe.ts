// Create src/app/shared/pipes/dynamic.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicPipe',
  standalone: true
})
export class DynamicPipe implements PipeTransform {
  transform(value: any, pipeName?: string, pipeArgs?: any[]): any {
    if (!pipeName) return value;
    
    // Handle different pipe types
    switch (pipeName) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: pipeArgs?.[0] || 'USD'
        }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'uppercase':
        return value?.toString().toUpperCase();
      case 'lowercase':
        return value?.toString().toLowerCase();
      default:
        return value;
    }
  }
}