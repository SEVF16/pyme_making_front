// ticket-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

import { TicketsService } from '../../../services/tickets/tickets.service';
import { ITicket } from '../../../interfaces/tickets/ticket.interface';
import { Ticket } from '../../../interfaces/tickets/ticket.model';
import { TicketStatus } from '../../../interfaces/tickets/ticket-status.enum';

import { LucideAngularModule, ArrowLeft, Printer, XCircle, FileText } from 'lucide-angular';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { TicketNumberPipe } from '../../../shared/pipes/ticket-number.pipe';
import { TicketStatusPipe } from '../../../shared/pipes/ticket-status.pipe';
import { TicketStatusClassPipe } from '../../../shared/pipes/ticket-status-class.pipe';
import { TicketDisclaimerDirective } from '../../../shared/directives/ticket-disclaimer.directive';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonLibComponent,
    TicketNumberPipe,
    TicketStatusPipe,
    TicketStatusClassPipe,
    TicketDisclaimerDirective
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss',
  providers: [MessageService]
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketsService = inject(TicketsService);
  private messageService = inject(MessageService);

  ticket: Ticket | null = null;
  loading = true;
  error: string | null = null;

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly PrinterIcon = Printer;
  readonly XCircleIcon = XCircle;
  readonly FileTextIcon = FileText;

  // Enum reference for template
  readonly TicketStatus = TicketStatus;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const ticketId = params['id'];
      if (ticketId) {
        this.loadTicket(ticketId);
      }
    });
  }

  loadTicket(id: string): void {
    this.loading = true;
    this.error = null;

    this.ticketsService.getTicketById(id).subscribe({
      next: (response) => {
        this.ticket = new Ticket(response.data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ticket:', error);
        this.error = 'Error al cargar el ticket';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el ticket'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tickets']);
  }

  printTicket(): void {
    if (!this.ticket) return;
    this.router.navigate(['/tickets', this.ticket.id, 'print']);
  }

  cancelTicket(): void {
    if (!this.ticket || !this.ticket.canCancel()) return;

    const confirmed = confirm(
      `¿Está seguro de cancelar el ticket ${this.ticket.ticketNumber}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      const reason = prompt('Ingrese el motivo de cancelación (opcional):');

      this.ticketsService.cancelTicket(this.ticket.id, reason || undefined).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ticket cancelado exitosamente'
          });
          this.loadTicket(this.ticket!.id);
        },
        error: (error) => {
          console.error('Error cancelling ticket:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al cancelar el ticket'
          });
        }
      });
    }
  }

  convertToBoleta(): void {
    if (!this.ticket || !this.ticket.canConvert()) return;

    const confirmed = confirm(
      '⚠️ ADVERTENCIA\n\n' +
      'La conversión de Ticket a Boleta es IRREVERSIBLE.\n\n' +
      '- Se generará un DTE válido tributariamente\n' +
      '- El ticket no podrá modificarse\n' +
      '- El ticket no podrá cancelarse (deberá cancelar la boleta)\n\n' +
      '¿Está seguro de continuar?'
    );

    if (confirmed) {
      this.ticketsService.convertToBoleta(this.ticket.id).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ticket convertido a boleta exitosamente'
          });

          // Navegar a la boleta generada
          const invoiceId = response.data.invoice.id;
          this.router.navigate(['/invoices', invoiceId]);
        },
        error: (error) => {
          console.error('Error converting ticket:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al convertir el ticket'
          });
        }
      });
    }
  }

  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito'
    };
    return methods[method] || method;
  }

  getStatusBadgeClass(status: TicketStatus): string {
    const classes: Record<TicketStatus, string> = {
      [TicketStatus.DRAFT]: 'badge-warning',
      [TicketStatus.ISSUED]: 'badge-success',
      [TicketStatus.CANCELLED]: 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }
}
