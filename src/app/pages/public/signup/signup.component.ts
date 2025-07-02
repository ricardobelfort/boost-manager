import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, DividerModule, TooltipModule, InputTextModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly auth = inject(AuthService);

  showPassword = false;
  passwordTouched = false;
  passwordStrengthClass = '';
  passwordStrengthWidth = '0%';

  signupForm = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required, Validators.minLength(5)]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')],
    ],
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
          detail: 'Cadastro realizado! Verifique Your email para confirmar sua conta.',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.message || 'Erro ao cadastrar. Tente novamente.',
        });
      },
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

  onPasswordInput(): void {
    const passwordValue = this.password?.value || '';

    if (passwordValue.length > 0) {
      this.passwordTouched = true;
    } else {
      this.passwordTouched = false;
    }

    // Calcule a força
    let strength = 0;
    if (passwordValue.length >= 8) strength++;
    if (/[a-z]/.test(passwordValue)) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/\d/.test(passwordValue)) strength++;

    if (strength <= 1) {
      this.passwordStrengthClass = 'bg-red-400';
      this.passwordStrengthWidth = '25%';
    } else if (strength === 2) {
      this.passwordStrengthClass = 'bg-yellow-400';
      this.passwordStrengthWidth = '50%';
    } else if (strength === 3) {
      this.passwordStrengthClass = 'bg-blue-400';
      this.passwordStrengthWidth = '75%';
    } else if (strength === 4) {
      this.passwordStrengthClass = 'bg-lime-500';
      this.passwordStrengthWidth = '100%';
    } else {
      this.passwordStrengthClass = 'bg-gray-200';
      this.passwordStrengthWidth = '0%';
    }
  }

  passwordHasLowerCase(): boolean {
    return /[a-z]/.test(this.password?.value || '');
  }

  passwordHasUpperCase(): boolean {
    return /[A-Z]/.test(this.password?.value || '');
  }

  passwordHasNumber(): boolean {
    return /\d/.test(this.password?.value || '');
  }

  passwordHasMinLength(): boolean {
    return (this.password?.value || '').length >= 8;
  }
}
