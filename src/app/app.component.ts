import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  sidebarExpanded: boolean = false;
  isLoginPage = false;
  isAuthenticated = false;
  private routerSubscription!: Subscription;
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

ngOnInit(): void {
  // Suscribirse a los cambios de autenticación
  this.authSubscription = this.authService.authState$.subscribe(
    authState => {
      // console.log('App Component - Estado de auth cambió:', authState);
      this.isAuthenticated = authState.isAuthenticated;
      
      // Si está autenticado y está en login, redirigir
      if (this.isAuthenticated && this.isLoginPage) {
        // console.log('Usuario autenticado en página de login, redirigiendo...');
        this.router.navigate(['/companies']);
      }
    }
  );

  // Detectar cambios de ruta para determinar si es la página de login
  this.routerSubscription = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.isLoginPage = event.url === '/login' || event.urlAfterRedirects === '/login';
      console.log('Ruta cambió:', event.url, 'Es login:', this.isLoginPage);
    });

  // Verificar la ruta actual al inicializar
  this.checkIfLoginPage(this.router.url);
  console.log('App Component inicializado. Ruta actual:', this.router.url);
}

  ngOnDestroy(): void {
    // Limpiar las suscripciones al destruir el componente
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onToggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  expandSidebar(): void {
    this.sidebarExpanded = true;
  }

  collapseSidebar(): void {
    this.sidebarExpanded = false;
  }

  checkIfLoginPage(url: string): void {
    this.isLoginPage = url === '/login' || url.startsWith('/login?');
  }
}