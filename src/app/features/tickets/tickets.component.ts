// tickets.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { TicketsService } from '../../services/tickets/tickets.service';
import { TicketStateService } from '../../services/tickets/ticket-state.service';
import { ITicket } from '../../interfaces/tickets/ticket.interface';
import { TicketStatus } from '../../interfaces/tickets/ticket-status.enum';
import { TicketQueryDto } from '../../interfaces/tickets/ticket-query-params.interface';
import { ApiResponse } from '../../interfaces/api-response.interfaces';

import { CustomDataTableComponent } from '../../shared/components/data-table/custom-data-table.component';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { LucideAngularModule, Plus, Receipt } from 'lucide-angular';
import { TableColumn, TableConfig } from '../../shared/components/data-table/models/data-table.models';

import { TicketNumberPipe } from '../../shared/pipes/ticket-number.pipe';
import { TicketStatusPipe } from '../../shared/pipes/ticket-status.pipe';
import { TicketStatusClassPipe } from '../../shared/pipes/ticket-status-class.pipe';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomDataTableComponent,
    LucideAngularModule,
    ButtonLibComponent,
    TicketNumberPipe,
    TicketStatusPipe,
    TicketStatusClassPipe
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss',
  providers: [MessageService]
})
export class TicketsComponent implements OnInit {
  private messageService = inject(MessageService);
  private ticketsService = inject(TicketsService);
  private ticketStateService = inject(TicketStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  error: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  tickets: ITicket[] = [];
  data: any[] = [];

  // Filtros
  selectedStatus: TicketStatus | 'ALL' = 'ALL';
  searchTerm = '';

  // Icons
  readonly PlusIcon = Plus;
  readonly ReceiptIcon = Receipt;

  // Configuración de tabla
  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'ticketNumber',
      header: 'Número',
      template: 'nameWithSubtitle',
      subtitle: 'issueDate'
    },
    {
      field: 'customerName',
      header: 'Cliente'
    },
    {
      field: 'total',
      header: 'Total',
      align: 'right'
    },
    {
      field: 'paymentMethod',
      header: 'Método de Pago'
    },
    {
      field: 'status',
      header: 'Estado',
      template: 'badge',
      customRender: (rowData) => {
        const statusMap: Record<string, string> = {
          'DRAFT': 'Borrador',
          'ISSUED': 'Emitido',
          'CANCELLED': 'Cancelado'
        };
        return statusMap[rowData.status] || 'secondary';
      }
    },
    {
      field: 'actions',
      header: 'Acciones',
      width: '150px',
      align: 'center',
      actions: [
        {
          label: 'Ver',
          icon: 'eye',
          severity: 'info',
          tooltip: 'Ver detalles',
          command: (rowData) => this.viewTicketDetail(rowData)
        },
        {
          label: 'Imprimir',
          icon: 'print',
          severity: 'primary',
          tooltip: 'Imprimir ticket',
          command: (rowData) => this.printTicket(rowData),
          visible: (rowData) => rowData.status === 'ISSUED'
        },
        {
          label: 'Cancelar',
          icon: 'cancel',
          severity: 'danger',
          tooltip: 'Cancelar ticket',
          command: (rowData) => this.cancelTicket(rowData),
          visible: (rowData) => rowData.status === 'ISSUED' && !rowData.convertedToInvoiceId
        }
      ]
    }
  ]);

  readonly tableConfig = signal<TableConfig>({
    showPaginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    responsive: true,
    dataKey: 'id',
    emptyMessage: 'No hay tickets registrados',
    tableStyleClass: 'table-hover'
  });

  constructor() {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(page: number = 1): void {
    this.loading = true;
    this.error = null;

    // Obtener tenant ID desde localStorage
    const tenantId = localStorage.getItem('tenant_id');
    if (!tenantId) {
      this.error = 'No se encontró el ID de la compañía';
      this.loading = false;
      return;
    }

    const queryParams: TicketQueryDto = {
      limit: this.itemsPerPage,
      offset: (page - 1) * this.itemsPerPage,
      sortField: 'createdAt',
      sortDirection: 'DESC',
      companyId: tenantId
    };

    // Aplicar filtro de estado si no es ALL
    if (this.selectedStatus !== 'ALL') {
      queryParams.status = this.selectedStatus;
    }

    this.ticketsService.getTickets(queryParams).subscribe({
      next: (response) => {
        console.log('Tickets loaded:', response);
        this.tickets = response.data.result || [];
        this.totalItems = response.data.total || 0;
        this.setTableData(this.tickets);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los tickets';
        this.loading = false;
        console.error('Error loading tickets:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los tickets'
        });
      }
    });
  }

  private setTableData(tickets: ITicket[]): void {
    this.data = tickets.map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      issueDate: this.formatDate(ticket.issueDate),
      customerName: ticket.customerData?.name || 'Consumidor Final',
      total: this.formatCurrency(ticket.total),
      paymentMethod: this.formatPaymentMethod(ticket.paymentMethod),
      status: ticket.status,
      convertedToInvoiceId: ticket.convertedToInvoiceId,
      rawTicket: ticket
    }));
  }

  private viewTicketDetail(rowData: any): void {
    if (!rowData || !rowData.id) {
      console.warn('No se encontró id en rowData', rowData);
      return;
    }
    this.router.navigate([rowData.id], { relativeTo: this.route });
  }

  private printTicket(rowData: any): void {
    if (!rowData || !rowData.id) {
      return;
    }
    this.router.navigate([rowData.id, 'print'], { relativeTo: this.route });
  }

  private cancelTicket(rowData: any): void {
    if (!rowData || !rowData.id) {
      return;
    }

    const confirmed = confirm(
      `¿Está seguro de cancelar el ticket ${rowData.ticketNumber}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      const reason = prompt('Ingrese el motivo de cancelación (opcional):');

      this.ticketsService.cancelTicket(rowData.id, reason || undefined).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Ticket cancelado exitosamente'
          });
          this.loadTickets(this.currentPage);
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

  onStatusChange(status: TicketStatus | 'ALL'): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadTickets(this.currentPage);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    // TODO: Implementar búsqueda en backend
    this.currentPage = 1;
    this.loadTickets(this.currentPage);
  }

  refreshTickets(): void {
    this.loadTickets(this.currentPage);
  }

  // Helpers
  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito'
    };
    return methods[method] || method;
  }
}
