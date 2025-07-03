import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { LoadingService } from '@shared/services/loading.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, DividerModule],
  templateUrl: './recovery.component.html',
  styleUrl: './recovery.component.css',
})
export class RecoveryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly auth = inject(AuthService);
  private readonly loading = inject(LoadingService);

  recoveryForm = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required, Validators.minLength(5)]],
  });

  onSubmit() {
    if (this.recoveryForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Informe um Email válido.',
      });
      return;
    }

    this.loading.show();

    const { email } = this.recoveryForm.value;

    this.auth.recoverPassword(email!).subscribe({
      next: () => {
        this.loading.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Verifique Your email para redefinir Your password.',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.message || 'Erro ao solicitar recuperação. Tente novamente.',
        });
      },
    });
  }

  get email() {
    return this.recoveryForm.get('email');
  }
}
