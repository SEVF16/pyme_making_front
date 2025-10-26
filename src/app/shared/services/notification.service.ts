// src/app/shared/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'  // Esto lo hace disponible globalmente
})
export class NotificationService {
  private messageService = inject(MessageService);

  showSuccess(message: string, title: string = 'Éxito') {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000
    });
  }

  showError(message: string, title: string = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000
    });
  }

  showInfo(message: string, title: string = 'Información') {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000
    });
  }

  showWarn(message: string, title: string = 'Advertencia') {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000
    });
  }

  clear() {
    this.messageService.clear();
  }
}