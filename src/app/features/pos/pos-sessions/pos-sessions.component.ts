import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { POSSessionsService } from '../../../services/pos/pos-sessions.service';
import {
  POSSessionResponseDto,
  POSSessionStatus,
  POS_SESSION_STATUS_LABELS,
  POS_SESSION_STATUS_COLORS,
  getDiscrepancyColor
} from '../../../interfaces/pos.interfaces';
import { CustomDataTableComponent } from '../../../shared/components/custom-data-table/custom-data-table.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { ColumnConfig } from '../../../shared/components/custom-data-table/interfaces/column-config.interface';
import { Plus, Eye, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pos-sessions',
  standalone: true,
  imports: [
    CommonModule,
    CustomDataTableComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './pos-sessions.component.html',
  styleUrl: './pos-sessions.component.scss'
})
export class POSSessionsComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly EyeIcon = Eye;

  sessions = signal<POSSessionResponseDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);

  selectedStatus = signal<POSSessionStatus | 'ALL'>('ALL');

  statusOptions = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: POSSessionStatus.OPEN, label: POS_SESSION_STATUS_LABELS[POSSessionStatus.OPEN] },
    { value: POSSessionStatus.CLOSED, label: POS_SESSION_STATUS_LABELS[POSSessionStatus.CLOSED] },
    { value: POSSessionStatus.CLOSED_WITH_DISCREPANCY, label: POS_SESSION_STATUS_LABELS[POSSessionStatus.CLOSED_WITH_DISCREPANCY] }
  ];

  openSessionButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.PlusIcon,
    text: 'Abrir Sesión',
    iconPosition: 'left'
  };

  columns: ColumnConfig[] = [
    {
      key: 'sessionNumber',
      header: 'N° Sesión',
      sortable: true,
      width: '120px'
    },
    {
      key: 'posTerminalName',
      header: 'Terminal',
      sortable: true,
      width: '140px'
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      width: '150px',
      render: (row: POSSessionResponseDto) => this.renderStatus(row.status)
    },
    {
      key: 'openedAt',
      header: 'Abierta',
      sortable: true,
      width: '140px',
      render: (row: POSSessionResponseDto) => this.formatDate(row.openedAt)
    },
    {
      key: 'totalSales',
      header: 'Total Ventas',
      sortable: true,
      width: '130px',
      align: 'right',
      render: (row: POSSessionResponseDto) => this.formatCurrency(row.totalSales)
    },
    {
      key: 'transactionCount',
      header: 'Transacciones',
      sortable: true,
      width: '120px',
      align: 'center'
    },
    {
      key: 'cashDiscrepancy',
      header: 'Discrepancia',
      sortable: true,
      width: '130px',
      align: 'right',
      render: (row: POSSessionResponseDto) => this.renderDiscrepancy(row.cashDiscrepancy)
    },
    {
      key: 'openedByName',
      header: 'Abierta Por',
      sortable: true,
      width: '140px'
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: '100px',
      align: 'center',
      render: (row: POSSessionResponseDto) => this.renderActions(row)
    }
  ];

  constructor(
    private sessionsService: POSSessionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: any = {
      page: this.currentPage(),
      limit: this.pageSize()
    };

    if (this.selectedStatus() !== 'ALL') {
      query.status = this.selectedStatus();
    }

    this.sessionsService.list(query).subscribe({
      next: (response) => {
        this.sessions.set(response.data);
        this.totalItems.set(response.meta.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar las sesiones');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSessions();
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as POSSessionStatus | 'ALL';
    this.selectedStatus.set(value);
    this.currentPage.set(1);
    this.loadSessions();
  }

  clearFilters(): void {
    this.selectedStatus.set('ALL');
    this.currentPage.set(1);
    this.loadSessions();
  }

  navigateToOpenSession(): void {
    this.router.navigate(['/pos/sessions/open']);
  }

  viewSession(session: POSSessionResponseDto): void {
    this.router.navigate(['/pos/sessions', session.id]);
  }

  onRowClick(session: POSSessionResponseDto): void {
    this.viewSession(session);
  }

  renderStatus(status: POSSessionStatus): string {
    const label = POS_SESSION_STATUS_LABELS[status];
    const color = POS_SESSION_STATUS_COLORS[status];
    return `<span class="status-badge" style="background-color: ${color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${label}</span>`;
  }

  renderDiscrepancy(discrepancy: number): string {
    const color = getDiscrepancyColor(discrepancy);
    const formatted = this.formatCurrency(discrepancy);
    return `<span style="color: ${color}; font-weight: 600;">${formatted}</span>`;
  }

  renderActions(session: POSSessionResponseDto): string {
    return `<button class="action-button view-button" data-id="${session.id}" title="Ver detalle">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>`;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
}
