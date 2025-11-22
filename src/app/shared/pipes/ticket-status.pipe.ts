// ticket-status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TicketStatus } from '../../interfaces/tickets/ticket-status.enum';

/**
 * Pipe para traducir el estado del ticket al español
 */
@Pipe({
  name: 'ticketStatus',
  standalone: true
})
export class TicketStatusPipe implements PipeTransform {
  private statusLabels: Record<TicketStatus, string> = {
    [TicketStatus.DRAFT]: 'Borrador',
    [TicketStatus.ISSUED]: 'Emitido',
    [TicketStatus.CANCELLED]: 'Cancelado'
  };

  transform(status: TicketStatus | string): string {
    if (!status) {
      return '';
    }

    return this.statusLabels[status as TicketStatus] || status;
  }
}
