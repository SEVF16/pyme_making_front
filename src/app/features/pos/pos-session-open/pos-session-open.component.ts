import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { POSSessionsService } from '../../../services/pos/pos-sessions.service';
import { OpenPOSSessionDto } from '../../../interfaces/pos.interfaces';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { ArrowLeft, Save, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pos-session-open',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './pos-session-open.component.html',
  styleUrl: './pos-session-open.component.scss'
})
export class POSSessionOpenComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SaveIcon = Save;

  sessionForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  backButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.ArrowLeftIcon,
    text: 'Volver',
    iconPosition: 'left'
  };

  openButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Abrir Sesión',
    iconPosition: 'left'
  };

  constructor(
    private fb: FormBuilder,
    private sessionsService: POSSessionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkExistingSession();
  }

  initForm(): void {
    this.sessionForm = this.fb.group({
      companyId: [localStorage.getItem('tenant_id'), Validators.required],
      posTerminalId: ['CAJA-01', Validators.required],
      posTerminalName: ['Caja Principal', Validators.required],
      openedBy: [localStorage.getItem('user_id'), Validators.required],
      openedByName: [localStorage.getItem('user_name'), Validators.required],
      openingCash: [0, [Validators.required, Validators.min(0)]],
      openingNotes: ['']
    });
  }

  checkExistingSession(): void {
    const terminalId = this.sessionForm.get('posTerminalId')?.value;

    this.sessionsService.getOpenSessionByTerminal(terminalId).subscribe({
      next: (session) => {
        if (session) {
          this.error.set(`Ya existe una sesión abierta para el terminal ${terminalId}`);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pos/sessions']);
  }

  openSession(): void {
    if (this.sessionForm.invalid) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const openDto: OpenPOSSessionDto = this.sessionForm.value;

    this.sessionsService.openSession(openDto).subscribe({
      next: (session) => {
        this.loading.set(false);
        localStorage.setItem('current_session_id', session.id);
        this.router.navigate(['/pos/sales']);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al abrir la sesión');
      }
    });
  }
}
