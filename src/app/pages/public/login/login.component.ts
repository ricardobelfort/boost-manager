import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    DividerModule,
    TagModule,
    RouterLink,
    DialogModule,
    IftaLabelModule,
    TooltipModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly auth = inject(AuthService);

  passwordStrengthClass = '';
  passwordStrengthWidth = '0%';
  rememberMe = false;

  loginForm = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.email, Validators.required, Validators.minLength(5)]),
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
    ]),
    rememberMe: this.fb.nonNullable.control(false),
  });

  showPassword = false;
  visible = false;
  passwordTouched = false;

  ngOnInit() {
    this.auth.session$.subscribe((session) => {
      if (session) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos corretamente.',
      });
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    this.auth.signIn(email!, password!, rememberMe ?? false).subscribe({
      next: (response) => {
        if (response.error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: response.error.message || 'E-mail ou senha inválidos.',
          });
          return;
        }

        if (!response.data?.session) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Sessão não iniciada. Tente novamente.',
          });
          return;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Bem-vindo(a), ${email}!`,
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err?.message || 'Erro de comunicação com o servidor.',
        });
      },
    });
  }

  get email() {
    return this.loginForm.get('email');
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

  get password() {
    return this.loginForm.get('password');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  showDialog() {
    this.visible = true;
  }

  recovery() {
    this.router.navigate(['/auth/recovery']);
  }
}
