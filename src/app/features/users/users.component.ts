import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomDataTableComponent } from '../../shared/components/data-table/custom-data-table.component';
import { Building2, LucideAngularModule, Plus } from 'lucide-angular';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { SidebarViewComponent } from '../../shared/components/sidebar-view/sidebar-view.component';
import { UsersService } from '../../services/users/users.service';
import { TableColumn, TableConfig } from '../../shared/components/data-table/models/data-table.models';
import { ICustomer } from '../../interfaces/customers/customers.interfaces';
import { IUserQuery } from '../../interfaces/users/users-query-params.interfaces';
import { ApiResponse } from '../../interfaces/api-response.interfaces';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDataTableComponent,
         LucideAngularModule, ButtonLibComponent, SidebarViewComponent,],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  loading = false;
  error: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  hasNext = false;
  customers: ICustomer[]= [];
    readonly Building2Icon = Building2;
  readonly PlusIcon = Plus;
  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'name',
      header: 'Cliente',
      template: 'nameWithSubtitle', // ✨ Activa el template especial
      subtitle: 'rut', 
    },
    {
      field: 'email',
      header: 'Correo',
    },
    {
      field: 'phone',
      header: 'Telefono',
    },
    {
      field: 'customerType',
      header: 'Tipo de cliente',
    },
    {
      field: 'status',
      header: 'Estatus',
      template: 'badge',
          customRender: (rowData) => {
      // Retorna la clase del badge según el status
      const statusMap: Record<string, string> = {
        'active': 'Activo',
        'Inactivo': 'secondary',
        'Suspendido': 'danger'
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
          command: (rowData, rowIndex) => this.loadUsers(rowData)
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          tooltip: 'Editar empresa',
          command: (rowData, rowIndex) => this.loadUsers(rowData),
          visible: (rowData) => rowData.status !== 'Suspendido'
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          tooltip: 'Eliminar empresa',
          command: (rowData, rowIndex) => this.loadUsers(rowData),
          visible: (rowData) => rowData.status === 'Inactivo'
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
    emptyMessage: 'No hay empresas registradas',
    tableStyleClass: 'table-hover'
  });
  public data: any = [];
  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 1): void {
    this.loading = true;
    this.error = null;
    
    const offset = (page - 1) * this.itemsPerPage;
    
    const queryParams: IUserQuery = {
      limit: this.itemsPerPage,
      offset: offset,
      sortField: 'createdAt',
      sortDirection: 'ASC',
    };

    this.usersService.getUsers(queryParams).subscribe({
      next: (response: ApiResponse<any>) => {
        console.log(response.data.result);
  this.setTable(response.data.result);
      },
      error: (error) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }
    private setTable(customer: ICustomer[]): void {
      this.data = customer.map(customer => ({
        rut: customer.rut,
        name: customer.firstName,
        email: customer.email,
        phone: customer.phone,
        customerType: customer.customerType,
        //status: customer.status,
      }));
    }
}
