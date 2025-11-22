// ticket-number.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatear el número de ticket
 * Ejemplo: TICKET-2025-000123 → TICKET-2025-#000123
 */
@Pipe({
  name: 'ticketNumber',
  standalone: true
})
export class TicketNumberPipe implements PipeTransform {
  transform(ticketNumber: string): string {
    if (!ticketNumber) {
      return '';
    }

    // Patrón: TICKET-YYYY-NNNNNN → TICKET-YYYY-#NNNNNN
    return ticketNumber.replace(/^(TICKET-\d{4}-)(\d+)$/, '$1#$2');
  }
}
