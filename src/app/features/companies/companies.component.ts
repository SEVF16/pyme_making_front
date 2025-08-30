// companies.component.ts
import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG & UI
import { LucideAngularModule, Building2, Plus, Eye, Edit, Trash2, Mail, Phone, Search, User, Calendar, Lock } from 'lucide-angular';
import { CustomDataTableComponent } from '../../shared/components/data-table/custom-data-table.component';
import { PageEvent, TableColumn, TableConfig } from '../../shared/components/data-table/models/data-table.models';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CustomDataTableComponent,
    LucideAngularModule,
    ButtonLibComponent,
    ReactiveFormsModule,
    InputComponent
  ],
  
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})

export class CompaniesComponent implements OnInit {
  // Icons
  readonly Building2Icon = Building2;
  readonly PlusIcon = Plus;
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;

    mailIcon = Mail;
  phoneIcon = Phone;
  lockIcon = Lock;
  searchIcon = Search;
  userIcon = User;
  calendarIcon = Calendar;
  userForm!: FormGroup;
  // State
  readonly currentPageInfo = signal<string>('Página 1 de 3');

  // Data - Empresas de ejemplo
  readonly companies = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      rut: '76.123.456-7',
      businessName: 'Comercial Los Andes Limitada',
      fantasyName: 'Los Andes',
      email: 'contacto@losandes.cl',
      phone: '+56 2 2345 6789',
      city: 'Santiago',
      region: 'Región Metropolitana',
      companySize: 'Mediana',
      status: 'Activo',
      createdAt: '2023-01-15'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      rut: '99.876.543-2',
      businessName: 'Transportes del Norte S.A.',
      fantasyName: 'TransNorte',
      email: 'info@transnorte.cl',
      phone: '+56 55 2987 6543',
      city: 'Antofagasta',
      region: 'Región de Antofagasta',
      companySize: 'Grande',
      status: 'Activo',
      createdAt: '2023-02-20'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      rut: '12.345.678-9',
      businessName: 'Tecnología Innovadora SpA',
      fantasyName: 'TechInova',
      email: 'hello@techinova.cl',
      phone: '+56 2 3456 7890',
      city: 'Santiago',
      region: 'Región Metropolitana',
      companySize: 'Pequeña',
      status: 'Activo',
      createdAt: '2023-03-10'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      rut: '87.654.321-0',
      businessName: 'Construcciones del Sur Ltda.',
      fantasyName: 'ConSur',
      email: 'ventas@consur.cl',
      phone: '+56 63 2456 7891',
      city: 'Temuco',
      region: 'Región de La Araucanía',
      companySize: 'Mediana',
      status: 'Inactivo',
      createdAt: '2023-04-05'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      rut: '65.432.109-8',
      businessName: 'Alimentaria Valparaíso S.A.',
      fantasyName: 'AlimVal',
      email: 'contacto@alimval.cl',
      phone: '+56 32 2567 8901',
      city: 'Valparaíso',
      region: 'Región de Valparaíso',
      companySize: 'Grande',
      status: 'Suspendido',
      createdAt: '2023-05-12'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      rut: '44.555.666-3',
      businessName: 'Servicios Profesionales Norte Ltda.',
      fantasyName: 'ServNorte',
      email: 'contacto@servnorte.cl',
      phone: '+56 51 2789 0123',
      city: 'La Serena',
      region: 'Región de Coquimbo',
      companySize: 'Pequeña',
      status: 'Activo',
      createdAt: '2023-06-18'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      rut: '33.444.555-1',
      businessName: 'Minería del Cobre S.A.',
      fantasyName: 'MinerCobre',
      email: 'info@minercobre.cl',
      phone: '+56 55 2890 1234',
      city: 'Calama',
      region: 'Región de Antofagasta',
      companySize: 'Grande',
      status: 'Activo',
      createdAt: '2023-07-25'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      rut: '22.333.444-9',
      businessName: 'Comercio Electrónico del Sur SpA',
      fantasyName: 'EcommSur',
      email: 'ventas@ecommsur.cl',
      phone: '+56 41 2901 2345',
      city: 'Concepción',
      region: 'Región del Biobío',
      companySize: 'Mediana',
      status: 'Activo',
      createdAt: '2023-08-30'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440009',
      rut: '11.222.333-7',
      businessName: 'Agrícola Los Valles Ltda.',
      fantasyName: 'AgroValles',
      email: 'contacto@agrovalles.cl',
      phone: '+56 75 2012 3456',
      city: 'Talca',
      region: 'Región del Maule',
      companySize: 'Mediana',
      status: 'Activo',
      createdAt: '2023-09-15'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      rut: '88.999.000-5',
      businessName: 'Logística Integral Chile S.A.',
      fantasyName: 'LogiChile',
      email: 'operaciones@logichile.cl',
      phone: '+56 2 3123 4567',
      city: 'Santiago',
      region: 'Región Metropolitana',
      companySize: 'Grande',
      status: 'Activo',
      createdAt: '2023-10-20'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      rut: '77.888.999-4',
      businessName: 'Turismo Patagónico SpA',
      fantasyName: 'PatagoniaTour',
      email: 'reservas@patagoniatour.cl',
      phone: '+56 61 2234 5678',
      city: 'Puerto Natales',
      region: 'Región de Magallanes',
      companySize: 'Pequeña',
      status: 'Inactivo',
      createdAt: '2023-11-08'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      rut: '66.777.888-2',
      businessName: 'Energías Renovables del Norte Ltda.',
      fantasyName: 'EnerNorte',
      email: 'info@enernorte.cl',
      phone: '+56 57 2345 6789',
      city: 'Iquique',
      region: 'Región de Tarapacá',
      companySize: 'Grande',
      status: 'Activo',
      createdAt: '2023-12-01'
    }
  ];

  // Table Configuration
  readonly tableColumns = signal<TableColumn[]>([
    {
      field: 'fantasyName',
      header: 'Empresa',
      width: '200px'
    },
    {
      field: 'rut',
      header: 'RUT',
      width: '120px'
    },
    {
      field: 'email',
      header: 'Email',
      width: '220px'
    },
    {
      field: 'city',
      header: 'Ciudad',
      width: '120px'
    },
    {
      field: 'companySize',
      header: 'Tamaño',
      width: '100px',
      align: 'center'
    },
    {
      field: 'status',
      header: 'Estado',
      width: '100px',
      align: 'center'
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
          command: (rowData, rowIndex) => this.viewCompany(rowData)
        },
        {
          label: 'Editar',
          icon: 'edit',
          severity: 'primary',
          tooltip: 'Editar empresa',
          command: (rowData, rowIndex) => this.editCompany(rowData),
          visible: (rowData) => rowData.status !== 'Suspendido'
        },
        {
          label: 'Eliminar',
          icon: 'delete',
          severity: 'danger',
          tooltip: 'Eliminar empresa',
          command: (rowData, rowIndex) => this.deleteCompany(rowData),
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
  constructor(private fb: FormBuilder){

  }
  ngOnInit(): void {
        this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{3}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      search: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      birthDate: ['', Validators.required],
    });
  }
   onSubmit(): void {
    if (this.userForm.valid) {
      console.log('Formulario válido:', this.userForm.value);
      alert('Formulario enviado correctamente!');
    } else {
      console.log('Formulario inválido');
      this.markAllFieldsAsTouched();
    }
  }
  
  clearForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      generatedCode: this.generateCode()
    });
  }
  
  getFormValues(): any {
    return this.userForm.value;
  }
  
  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control && control.errors && control.touched) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
  
  private markAllFieldsAsTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }
  
  private generateCode(): string {
    return 'AUTO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  // Event Handlers
  onPageChange(event: PageEvent): void {
    console.log('Cambio de página:', event);
    this.currentPageInfo.set(`Página ${event.page + 1} de ${event.pageCount}`);
  }

  // Company Actions
  viewCompany(company: any): void {
    console.log('Ver empresa:', company);
    // Implementar navegación o modal
    // this.router.navigate(['/companies', company.id]);
  }

  editCompany(company: any): void {
    console.log('Editar empresa:', company);
    // Implementar navegación o modal
    // this.router.navigate(['/companies', company.id, 'edit']);
  }

  deleteCompany(company: any): void {
    if (confirm(`¿Está seguro de eliminar la empresa "${company.fantasyName}"?`)) {
      console.log('Eliminar empresa:', company);
      // Implementar lógica de eliminación
      // this.companyService.delete(company.id).subscribe(...)
    }
  }
}