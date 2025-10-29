import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Pencil, Trash2, LucideAngularModule, Plus, Users } from 'lucide-angular';
import { UsersService } from '../../services/users/users.service';
import { IUserQuery } from '../../interfaces/users/users-query-params.interfaces';
import { ApiPaginatedResponse, ApiResponse } from '../../interfaces/api-response.interfaces';
import { ICreateUserDto, IUpdateUserDto, IUser } from '../../interfaces/users/user-interfaces';
import { ButtonModule } from 'primeng/button';
import { SidebarViewComponent } from '../../shared/components/sidebar-view/sidebar-view.component';
import { FormMode, UserFormComponent } from './user-form/user-form.component';
import { ButtonLibComponent } from '../../shared/components/buttonlib/button-lib.component';
import { SidebarConfig } from '../../shared/components/sidebar-view/interfaces/siderbar-config.interface';
import { CreateUserDto, User } from '../../interfaces/users/user.models';
import { DataChangeEvent } from '../../shared/interfaces/data-change-event.interface';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonModule,
    SidebarViewComponent,
    UserFormComponent,
    ButtonLibComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  // State management con signals
  users = signal<IUser[]>([]);
  createUserDto= signal<ICreateUserDto | null>(null);
  updateUserDto= signal<IUpdateUserDto | null>(null);
  userDto= signal<IUser | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  formSidebarConfig: SidebarConfig = { visible: false, position: 'right', size: 'full'  };
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;
  hasNext = false;
  public mode : FormMode = FormMode.CREATE
  // Lucide icons
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;
  readonly PlusIcon = Plus;
  readonly UsersIcon = Users;
  isDisabled : boolean = false;
  constructor(private usersService: UsersService,
        private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga los usuarios desde el servicio
   * @param page - Número de página a cargar (default: 1)
   */
  loadUsers(page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const offset = (page - 1) * this.itemsPerPage;

    const queryParams: IUserQuery = {
      limit: this.itemsPerPage,
      offset: offset,
      sortField: 'createdAt',
      sortDirection: 'DESC',
    };

    this.usersService.getUsers(queryParams).subscribe({
      next: (response: ApiPaginatedResponse<IUser[]>) => {
        // El servicio retorna ApiPaginatedResponse<IUser[]>, pero la estructura real
        // hace que response.data.result sea IUser[][]
        // Usamos un type assertion para corregir esto
        const users = response.data.result as unknown as IUser[];
        this.users.set(users);
        this.hasNext = response.data.hasNext;
        this.currentPage = page;
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar los usuarios');
        this.loading.set(false);
        console.error('Error loading users:', error);
      }
    });
  }

    openFormSidebar(): void {
    this.formSidebarConfig.visible = true;
  }
  /**
   * Maneja el evento de edición de usuario
   * @param user - Usuario a editar
   */
  onEditUser(user: IUser): void {
    console.log('Editando usuario:', user);
    this.formSidebarConfig.visible = true;
    this.mode = FormMode.EDIT;
    this.userDto.set(user);
    const userDto: ICreateUserDto = User.userToCreateDto(user);
    this.createUserDto.set(userDto);
  }

  onSaveNewUser(): void { 
    if(this.mode === FormMode.EDIT){
      this.editUser();
    }else{
      this.saveUser();
    }

  }
  /**
   * Maneja el evento de eliminación de usuario
   * @param user - Usuario a eliminar
   */
  onDeleteUser(user: IUser): void {
    console.log('Eliminando usuario:', user);
    // TODO: Implementar lógica de eliminación (confirmación, llamada al servicio, etc.)
  }

  /**
   * Retorna el badge CSS class según el status del usuario
   * @param status - Status del usuario
   */
  getStatusBadgeClass(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'badge-success',
      'inactive': 'badge-secondary',
      'suspended': 'badge-danger',
      'pending': 'badge-warning'
    };
    return statusMap[status.toLowerCase()] || 'badge-secondary';
  }

  /**
   * Retorna el texto traducido del status
   * @param status - Status del usuario
   */
  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'suspended': 'Suspendido',
      'pending': 'Pendiente'
    };
    return statusLabels[status.toLowerCase()] || status;
  }

  /**
   * Retorna el texto traducido del rol
   * @param role - Rol del usuario
   */
  getRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'employee': 'Empleado',
      'viewer': 'Visor'
    };
    return roleLabels[role.toLowerCase()] || role;
  }
saveUser(): void {
  const userDto = this.createUserDto();
  if (userDto) {
    this.usersService.createUser(userDto).subscribe({
      next: (response: ApiResponse<IUser>) => {
        console.log('Customer enviado exitosamente:', response);
        this.notificationService.showSuccess('Cliente creado con éxito');
        this.formSidebarConfig.visible = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error enviando customer:', error);
        this.notificationService.showError(
          error.message || 'Error al crear el cliente'
        );
      }
    });
  } else {
    console.warn('No user data available to save');
    this.notificationService.showError('No hay datos de usuario para guardar');
  }
}
editUser(): void {
  const userDto = this.updateUserDto();
  const userId = this.userDto()?.id;
  if (userDto && userId) {
    this.usersService.updateUser(userId,userDto).subscribe({
      next: (response: ApiResponse<IUser>) => {
        console.log('Customer enviado exitosamente:', response);
        this.notificationService.showSuccess('Cliente actualizado con éxito');
        this.formSidebarConfig.visible = false;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error enviando customer:', error);
        this.notificationService.showError(
          error.message || 'Error al actualizar el cliente'
        );
      }
    });
  } else {
    console.warn('No user data available to save');
    this.notificationService.showError('No hay datos de usuario para guardar');
  }
}

  public onUserEventChange(event: DataChangeEvent<ICreateUserDto>) {
    console.log(event);
    if (event.isValid) {
      this.isDisabled = event.isValid;
      if (this.mode === FormMode.CREATE) {
        this.createUserDto.set(new CreateUserDto(event.data));
      }else{
        this.updateUserDto.set(CreateUserDto.createToUpdateDto(event.data));
      }
    }

    console.log(this.createUserDto());
  }
}
