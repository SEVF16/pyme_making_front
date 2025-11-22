import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantConfigService } from '../../../services/tenant-config/tenant-config.service';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { CheckCircle, Settings, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-config-init',
  standalone: true,
  imports: [
    CommonModule,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './config-init.component.html',
  styleUrl: './config-init.component.scss'
})
export class ConfigInitComponent {
  readonly CheckCircleIcon = CheckCircle;
  readonly SettingsIcon = Settings;

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  initButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'lg',
    icon: this.CheckCircleIcon,
    text: 'Inicializar Configuración',
    iconPosition: 'left'
  };

  constructor(
    private configService: TenantConfigService,
    private router: Router
  ) {}

  initializeConfig(): void {
    this.loading.set(true);
    this.error.set(null);

    this.configService.initializeConfig().subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/config']);
      },
      error: (error) => {
        this.loading.set(false);
        if (error.status === 409) {
          this.error.set('Ya existe una configuración para este tenant');
          setTimeout(() => {
            this.router.navigate(['/config']);
          }, 2000);
        } else {
          this.error.set('Error al inicializar la configuración');
        }
      }
    });
  }
}
