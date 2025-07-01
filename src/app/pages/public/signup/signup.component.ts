import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    DividerModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly auth = inject(AuthService);

  showPassword = false;

  signupForm = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required, Validators.minLength(5)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos corretamente.',
      });
      return;
    }

    const { email, password, confirmPassword } = this.signupForm.value;

    if (password !== confirmPassword) {
      this.signupForm.get('confirmPassword')?.setErrors({ notMatching: true });
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'As senhas não coincidem.',
      });
      return;
    }

    this.auth.signUp(email!, password!).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cadastro realizado! Verifique seu e-mail para confirmar sua conta.',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.message || 'Erro ao cadastrar. Tente novamente.',
        });
      }
    });
  }

  get email() {
    return this.signupForm.get('email');
  }
  get password() {
    return this.signupForm.get('password');
  }
  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }
}
