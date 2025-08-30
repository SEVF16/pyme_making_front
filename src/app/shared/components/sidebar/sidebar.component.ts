import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BarChart3, Home, List, LucideAngularModule, Package, Settings, Tags, UserPlus, Users } from 'lucide-angular';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { SidebarMenuItem } from '../../interfaces/menu-item.interface';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [    CommonModule,
    RouterModule,
    TooltipModule,
    LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
@Input() isExpanded: boolean = false;
  
  // Iconos de Lucide
  readonly HomeIcon = Home;
  readonly UsersIcon = Users;
  readonly PackageIcon = Package;
  readonly BarChart3Icon = BarChart3;
  readonly SettingsIcon = Settings;
  readonly UserPlusIcon = UserPlus;
  readonly ListIcon = List;
  readonly TagsIcon = Tags;
  
  // Items del menú principal
  menuItems: SidebarMenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'Home',
      routerLink: 'companies',
      expanded: false
    },
    {
      label: 'Usuarios',
      icon: 'Users',
      expanded: false,
      items: [
        {
          label: 'Lista de usuarios',
          icon: 'List',
          routerLink: '/users'
        },
        {
          label: 'Nuevo usuario',
          icon: 'UserPlus',
          routerLink: '/users/new'
        }
      ]
    },
    {
      label: 'Productos',
      icon: 'Package',
      expanded: false,
      items: [
        {
          label: 'Inventario',
          icon: 'List',
          routerLink: '/products'
        },
        {
          label: 'Categorías',
          icon: 'Tags',
          routerLink: '/categories'
        }
      ]
    },
    {
      label: 'Reportes',
      icon: 'BarChart3',
      routerLink: '/reports',
      expanded: false
    },
    {
      label: 'Configuración',
      icon: 'Settings',
      routerLink: '/settings',
      expanded: false
    }
  ];

  /**
   * TrackBy function para optimizar el rendering de listas
   */
  trackByFn(index: number, item: MenuItem): string | undefined {
    return item.label;
  }

  /**
   * Toggle del estado expandido de un item con submenús
   */
  toggleMenuItem(item: MenuItem): void {
    if (item.items) {
      item.expanded = !item.expanded;
    }
  }

  /**
   * Mapea el nombre del icono al componente de Lucide correspondiente
   */
  getIconComponent(iconName: string): any {
    const iconMap: { [key: string]: any } = {
      'Home': this.HomeIcon,
      'Users': this.UsersIcon,
      'Package': this.PackageIcon,
      'BarChart3': this.BarChart3Icon,
      'Settings': this.SettingsIcon,
      'UserPlus': this.UserPlusIcon,
      'List': this.ListIcon,
      'Tags': this.TagsIcon
    };
    return iconMap[iconName] || this.HomeIcon;
  }
}
