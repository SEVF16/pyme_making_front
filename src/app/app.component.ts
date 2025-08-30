import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  sidebarExpanded: boolean = false;
  isLoginPage = false;
  private routerSubscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(
        filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.checkIfLoginPage(event.url);
      });

    // Verificar la ruta actual al inicializar
    this.checkIfLoginPage(this.router.url);
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción al destruir el componente
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
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