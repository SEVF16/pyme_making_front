import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CustomersService } from '../../../services/customers/customers.service';
import { ICreateCustomerDto, ICustomer } from '../../../interfaces/customers/customers.interfaces';
import { ApiResponse } from '../../../interfaces/api-response.interfaces';
import { SidebarViewComponent } from '../../../shared/components/sidebar-view/sidebar-view.component';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { SidebarConfig } from '../../../shared/components/sidebar-view/interfaces/siderbar-config.interface';
import { DataChangeEvent } from '../../../shared/interfaces/data-change-event.interface';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ActivatedRoute } from '@angular/router';
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
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
  public readonly iconPencil = Pencil
  public customer!: ICustomer;
formSidebarConfig: SidebarConfig = { visible: false, position: 'right', size: 'large'  };
isDisabled : boolean = false;
private route = inject(ActivatedRoute)
    constructor(
      private customersService: CustomersService,
    ) {}
  ngOnInit(): void {
    const customerId = this.route.snapshot.params['id'];
      if (customerId) {
    this.getCustomer(customerId);
  } else {
    console.error('No customer ID found in route');
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

    console.log('Editar cliente:', this.customer.rut);
  }
    openFormSidebar(): void {
    this.formSidebarConfig.visible = true;
  }
    closeFormSidebar(): void {
    this.formSidebarConfig.visible = false;
    
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

    public onCustomerEventChange(event: DataChangeEvent<ICreateCustomerDto>) {
      console.log(event);

    }
}
