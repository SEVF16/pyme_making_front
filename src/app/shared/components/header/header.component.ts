import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Bell, LucideAngularModule, Menu } from 'lucide-angular';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { NavMenuItem } from '../../interfaces/menu-item.interface';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [    CommonModule,
    ButtonModule,
    MenubarModule,
    BadgeModule,
    LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  // Iconos de Lucide
  readonly MenuIcon = Menu;
  readonly BellIcon = Bell;
  
  // Items del menú del navbar
  navbarItems: NavMenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      items: [
        {
          label: 'Mi perfil',
          icon: 'pi pi-user',
          command: () => this.viewProfile()
        },
        {
          label: 'Configuración',
          icon: 'pi pi-cog',
          command: () => this.openSettings()
        },
        {
          separator: true
        },
        {
          label: 'Cerrar sesión',
          icon: 'pi pi-sign-out',
          command: () => this.logout()
        }
      ]
    }
  ];

  /**
   * Emite el evento para toggle del sidebar
   */
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  /**
   * Navegar al perfil del usuario
   */
  viewProfile(): void {
    console.log('Ver perfil');
    // Aquí puedes agregar la navegación real: this.router.navigate(['/profile'])
  }

  /**
   * Abrir configuración
   */
  openSettings(): void {
    console.log('Abrir configuración');
    // Aquí puedes agregar la navegación real: this.router.navigate(['/settings'])
  }

  /**
   * Cerrar sesión del usuario
   */
  logout(): void {
    console.log('Cerrar sesión');
    // Aquí puedes agregar la lógica real de logout: this.authService.logout()
  }
}
