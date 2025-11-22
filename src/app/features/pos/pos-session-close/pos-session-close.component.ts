import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { POSSessionsService } from '../../../services/pos/pos-sessions.service';
import { POSSessionResponseDto, ClosePOSSessionDto } from '../../../interfaces/pos.interfaces';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonLibComponent } from '../../../shared/components/buttonlib/button-lib.component';
import { ButtonConfig } from '../../../shared/components/buttonlib/interfaces/button.interface';
import { ArrowLeft, Save, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pos-session-close',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonLibComponent,
    LucideAngularModule
  ],
  templateUrl: './pos-session-close.component.html',
  styleUrl: './pos-session-close.component.scss'
})
export class POSSessionCloseComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SaveIcon = Save;

  session = signal<POSSessionResponseDto | null>(null);
  closeForm!: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  backButtonConfig: ButtonConfig = {
    variant: 'outline',
    size: 'md',
    icon: this.ArrowLeftIcon,
    text: 'Volver',
    iconPosition: 'left'
  };

  closeButtonConfig: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    icon: this.SaveIcon,
    text: 'Cerrar Sesión',
    iconPosition: 'left'
  };

  constructor(
    private fb: FormBuilder,
    private sessionsService: POSSessionsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSession(id);
    }
    this.initForm();
  }

  loadSession(id: string): void {
    this.loading.set(true);

    this.sessionsService.getById(id).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la sesión');
        this.loading.set(false);
      }
    });
  }

  initForm(): void {
    this.closeForm = this.fb.group({
      actualClosingCash: [0, [Validators.required, Validators.min(0)]],
      closedBy: [localStorage.getItem('user_id'), Validators.required],
      closedByName: [localStorage.getItem('user_name'), Validators.required],
      closingNotes: ['']
    });
  }

  goBack(): void {
    this.router.navigate(['/pos/sessions']);
  }

  closeSession(): void {
    if (!this.session() || this.closeForm.invalid) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const closeDto: ClosePOSSessionDto = this.closeForm.value;

    this.sessionsService.closeSession(this.session()!.id, closeDto).subscribe({
      next: () => {
        this.loading.set(false);
        localStorage.removeItem('current_session_id');
        this.router.navigate(['/pos/sessions']);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cerrar la sesión');
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
