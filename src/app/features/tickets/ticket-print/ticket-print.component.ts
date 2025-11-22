// ticket-print.component.ts
import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TicketsService } from '../../../services/tickets/tickets.service';
import { ITicket } from '../../../interfaces/tickets/ticket.interface';
import { Ticket } from '../../../interfaces/tickets/ticket.model';

import { TicketNumberPipe } from '../../../shared/pipes/ticket-number.pipe';
import { TicketDisclaimerDirective } from '../../../shared/directives/ticket-disclaimer.directive';

@Component({
  selector: 'app-ticket-print',
  standalone: true,
  imports: [
    CommonModule,
    TicketNumberPipe,
    TicketDisclaimerDirective
  ],
  templateUrl: './ticket-print.component.html',
  styleUrl: './ticket-print.component.scss'
})
export class TicketPrintComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketsService = inject(TicketsService);

  ticket: Ticket | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const ticketId = params['id'];
      if (ticketId) {
        this.loadTicket(ticketId);
      }
    });
  }

  ngAfterViewInit(): void {
    // Auto-trigger print dialog after view is loaded and ticket is ready
    // Small delay to ensure content is fully rendered
    setTimeout(() => {
      if (this.ticket && !this.loading && !this.error) {
        this.print();
      }
    }, 500);
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
        this.error = 'Error al cargar el ticket para impresión';
        this.loading = false;
      }
    });
  }

  print(): void {
    window.print();
  }

  close(): void {
    window.close();
    // Si no se cierra la ventana, navegar de vuelta
    setTimeout(() => {
      this.router.navigate(['/tickets', this.ticket?.id]);
    }, 100);
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

  getTenantInfo(): { name: string; rut: string; address: string } {
    // TODO: Obtener información real del tenant desde un servicio
    return {
      name: 'Mi Empresa SpA',
      rut: '12.345.678-9',
      address: 'Av. Principal 123, Santiago, Chile'
    };
  }
}
