// ticket-status-class.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TicketStatus } from '../../interfaces/tickets/ticket-status.enum';

/**
 * Pipe para obtener la clase CSS según el estado del ticket
 */
@Pipe({
  name: 'ticketStatusClass',
  standalone: true
})
export class TicketStatusClassPipe implements PipeTransform {
  private statusClasses: Record<TicketStatus, string> = {
    [TicketStatus.DRAFT]: 'warning',
    [TicketStatus.ISSUED]: 'success',
    [TicketStatus.CANCELLED]: 'danger'
  };

  transform(status: TicketStatus | string): string {
    if (!status) {
      return 'secondary';
    }

    return this.statusClasses[status as TicketStatus] || 'secondary';
  }
}
