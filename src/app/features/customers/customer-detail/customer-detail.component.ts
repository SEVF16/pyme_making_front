import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ArrowLeft, LucideAngularModule, Pencil, Rows } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CustomersService } from '../../../services/customers/customers.service';
import { ICreateCustomerDto, ICustomer, IUpdateCustomerDto } from '../../../interfaces/customers/customers.interfaces';
import { ApiResponse } from '../../../interfaces/api-response.interfaces';
import { SidebarViewComponent } from '../../../shared/components/sidebar-view/sidebar-view.component';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { SidebarConfig } from '../../../shared/components/sidebar-view/interfaces/siderbar-config.interface';
import { DataChangeEvent } from '../../../shared/interfaces/data-change-event.interface';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [    CommonModule,
    CardModule,        
    TagModule,
    ButtonModule,
    LucideAngularModule,
    TooltipModule,
  SidebarViewComponent,
CustomerFormComponent,
ButtonLibComponent,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',

})
export class CustomerDetailComponent implements OnInit {
  public readonly iconPencil = Pencil; 
  public readonly iconArrow = ArrowLeft;
  public customer!: ICustomer;
  formSidebarConfig: SidebarConfig = { visible: false, position: 'right', size: 'large'  };
  isDisabled : boolean = false;
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute); 
  private router = inject(Router);
  private customerId: string = '';
  private customerUpdate!:IUpdateCustomerDto;
    constructor(
      private customersService: CustomersService,
    ) {}
  ngOnInit(): void {
    this.customerId = this.route.snapshot.params['id'];
    if (this.customerId) {
      this.getCustomer(this.customerId);

    }
  }

  // Método para el color del tag de status
  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch(status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warning';
      default: return 'info';
    }
  }

  public editCustomer(): void {
    this.updateCustomer(this.customerId)
  }
  openFormSidebar(): void {
    this.formSidebarConfig.visible = true;
  }
  closeFormSidebar(): void {
    this.formSidebarConfig.visible = false;
    
  }

  public backPage(): void {
    this.router.navigate(['/customers']);
  }
  getCustomer(id: string): void {
    this.customersService.getCustomer(id).subscribe({
      next: (response: ApiResponse<ICustomer>) => {
        if (response ) {
          
          this.customer = response.data;
          console.log(this.customer);
        }
      },
      error: (error) => {
        console.error('Error al obtener el cliente:', error);
      }
    });
  }

  updateCustomer(id: string): void {
        this.customersService.updateCustomer(id,this.customerUpdate).subscribe({
      next: (response : ApiResponse<ICustomer>) => {
       this.formSidebarConfig.visible = false;
       this.getCustomer(id); 
        this.notificationService.showSuccess(
          'Actualización exitosa',
        );
      },
      error: (error) => {
        this.notificationService.showError(
          'Error al actualizar',
        );
      }
    });
  }
  

  public onCustomerEventChange(event: DataChangeEvent<ICreateCustomerDto>) {
    console.log(event);
    this.isDisabled = event.isValid;
  if (event.isValid) {
    // Crear el objeto de actualización
    const { rut, firstName, lastName, companyId, ...updatableFields } = event.data;
    
    const updateData: IUpdateCustomerDto = {
      id: this.customer.id,
      ...updatableFields
    };
    this.customerUpdate = updateData;

  }
  }
}
