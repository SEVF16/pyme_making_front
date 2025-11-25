import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  BarChart3,
  Home,
  List,
  LucideAngularModule,
  Package,
  Settings,
  Tags,
  UserPlus,
  Users,
  FileText,
  CreditCard,
  ShoppingCart,
  FileSpreadsheet,
  Store,
  Receipt,
  Ticket
} from 'lucide-angular';
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
  readonly FileTextIcon = FileText;
  readonly CreditCardIcon = CreditCard;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly FileSpreadsheetIcon = FileSpreadsheet;
  readonly StoreIcon = Store;
  readonly ReceiptIcon = Receipt;
  readonly TicketIcon = Ticket;
  
  // Items del menú principal
  menuItems: SidebarMenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'Home',
      routerLink: '/companies',
      expanded: false
    },
    {
      label: 'Personas',
      icon: 'Users',
      expanded: false,
      items: [
        {
          label: 'Clientes',
          icon: 'Users',
          routerLink: '/customers'
        },
        {
          label: 'Usuarios',
          icon: 'UserPlus',
          routerLink: '/users'
        }
      ]
    },
    {
      label: 'Productos',
      icon: 'Package',
      routerLink: '/products',
      expanded: false
    },
    {
      label: 'Ventas',
      icon: 'ShoppingCart',
      expanded: false,
      items: [
        {
          label: 'Facturas',
          icon: 'FileText',
          routerLink: '/invoices'
        },
        {
          label: 'Cotizaciones',
          icon: 'FileSpreadsheet',
          routerLink: '/quotations'
        },
        {
          label: 'Pagos',
          icon: 'CreditCard',
          routerLink: '/payments'
        }
      ]
    },
    {
      label: 'Compras',
      icon: 'Receipt',
      expanded: false,
      items: [
        {
          label: 'Órdenes de Compra',
          icon: 'ShoppingCart',
          routerLink: '/purchase-orders'
        }
      ]
    },
    {
      label: 'Punto de Venta',
      icon: 'Store',
      expanded: false,
      items: [
        {
          label: 'Ventas POS',
          icon: 'Receipt',
          routerLink: '/pos/sales'
        },
        {
          label: 'Sesiones',
          icon: 'List',
          routerLink: '/pos/sessions'
        }
      ]
    },
    {
      label: 'Tickets',
      icon: 'Ticket',
      routerLink: '/tickets',
      expanded: false
    },
    {
      label: 'Reportes',
      icon: 'BarChart3',
      routerLink: '/reporting',
      expanded: false
    },
    {
      label: 'Configuración',
      icon: 'Settings',
      routerLink: '/config',
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
      'Tags': this.TagsIcon,
      'FileText': this.FileTextIcon,
      'CreditCard': this.CreditCardIcon,
      'ShoppingCart': this.ShoppingCartIcon,
      'FileSpreadsheet': this.FileSpreadsheetIcon,
      'Store': this.StoreIcon,
      'Receipt': this.ReceiptIcon,
      'Ticket': this.TicketIcon
    };
    return iconMap[iconName] || this.HomeIcon;
  }
}
