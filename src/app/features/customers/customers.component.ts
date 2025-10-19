import { Component, ContentChild, inject, OnInit, signal, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerQueryDto } from '../../interfaces/customers/customers-query-params.interfaces';
import { CustomersService } from '../../services/customers/customers.service';

import { ICreateCustomerDto, ICustomer } from '../../interfaces/customers/customers.interfaces';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomDataTableComponent } from '../../shared/components/data-table/custom-data-table.component';
import { Building2, LucideAngularModule, Plus } from 'lucide-angular';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { SidebarViewComponent } from '../../shared/components/sidebar-view/sidebar-view.component';
import { TableColumn, TableConfig } from '../../shared/components/data-table/models/data-table.models';
import { SidebarConfig } from '../../shared/components/sidebar-view/interfaces/siderbar-config.interface';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { DataChangeEvent } from '../../shared/interfaces/data-change-event.interface';
import { Customer } from '../../interfaces/customers/customers.models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDataTableComponent,
       LucideAngularModule, ButtonLibComponent, SidebarViewComponent, CustomerFormComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  providers: [MessageService]
})
export class CustomersComponent implements OnInit {
  private messageService = inject(MessageService);
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
          command: (rowData, rowIndex) => this.customerDetail(rowData)
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          tooltip: 'Editar empresa',
          command: (rowData, rowIndex) => this.loadCustomers(rowData),
          visible: (rowData) => rowData.status !== 'Suspendido'
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          tooltip: 'Eliminar empresa',
          command: (rowData, rowIndex) => this.loadCustomers(rowData),
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
  formSidebarConfig: SidebarConfig = { visible: false, position: 'right', size: 'large'  };
  isDisabled : boolean = false;
  public data: any = [];
  @ContentChild('footer') footerTemplate?: TemplateRef<any>;
  private customer!: Customer;
  constructor(
    private customersService: CustomersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(page: number = 1): void {
    this.loading = true;
    this.error = null;
    
    const offset = (page - 1) * this.itemsPerPage;
    
    const queryParams: CustomerQueryDto = {
      limit: this.itemsPerPage,
      offset: offset,
      sortField: 'createdAt',
      sortDirection: 'ASC',
    };

    this.customersService.getCustomers(queryParams).subscribe({
      next: (response: ApiPaginatedResponse<ICustomer>) => {
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
  private customerDetail(rowData: any): void {
    if (!rowData || !rowData.id) {
      console.warn('No se encontró id en rowData para navegar al detalle', rowData);
      return;
    }

    // Navega a /customers/:id (ruta relativa al módulo/route actual)
    this.router.navigate([rowData.id], { relativeTo: this.route });
  }
  private setTable(customer: ICustomer[]): void {
    this.data = customer.map(customer => ({
      id: customer.id,
      rut: customer.rut,
      name: customer.firstName,
      email: customer.email,
      phone: customer.phone,
      customerType: customer.customerType,
      status: customer.customerType,
    }));
  }
  openFormSidebar(): void {
    this.formSidebarConfig.visible = true;
  }
  closeFormSidebar(): void {
    this.formSidebarConfig.visible = false;
    
  }

  saveUser(): void {
    const customerDto = this.customer.toCreateDto();
    this.customersService.createCustomer(customerDto).subscribe({
    next: (response : ApiResponse<ICustomer>) => {
        console.log('Customer enviado exitosamente:', response);
                  this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente creado con éxito'
          });
       this.formSidebarConfig.visible = false;
       this.loadCustomers(); 
    },
    error: (error) => {
        console.error('Error enviando customer:', error);
                  this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al crear el cliente'
          });
    }
});
  }

  public onCustomerEventChange(event: DataChangeEvent<ICreateCustomerDto>) {
    console.log(event);
    this.isDisabled = event.isValid;

    this.customer = new Customer(event.data);
    console.log(this.customer);
  }
}
