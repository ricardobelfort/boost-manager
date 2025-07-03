import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { LoadingService } from '@shared/services/loading.service';
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
  private readonly loading = inject(LoadingService);

  showPassword = false;
  passwordTouched = false;
  passwordStrengthClass = '';
  passwordStrengthWidth = '0%';

  signupForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
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

  async onSubmit() {
    if (this.signupForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos corretamente.' });
      return;
    }

    this.loading.show();

    const { name, email, password, confirmPassword } = this.signupForm.value;

    if (password !== confirmPassword) {
      this.signupForm.get('confirmPassword')?.setErrors({ notMatching: true });
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Senhas não conferem.' });
      this.loading.hide();
      return;
    }

    // Opcional: check em profiles para UX
    if (await this.auth.emailExists(email!)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'E-mail já registrado',
        detail: 'Já existe conta com esse e-mail. Faça login ou recupere a senha.',
      });
      this.loading.hide();
      return;
    }

    // Aqui começa o fluxo correto
    this.auth.signUp(email!, password!).subscribe({
      next: (response) => {
        this.loading.hide();
        // ATENÇÃO: aqui pode vir { error: { message: ... } }
        if (response.error) {
          let detail = response.error.message || 'Erro ao cadastrar. Tente outro e-mail.';
          if (
            detail.toLowerCase().includes('already registered') ||
            detail.toLowerCase().includes('user already exists') ||
            detail.toLowerCase().includes('invalid login credentials')
          ) {
            detail = 'Já existe cadastro com este e-mail. Faça login ou recupere sua senha.';
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail,
          });
          return;
        }
        // Mesmo sem erro, pode faltar user
        if (!response.data?.user) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar conta. Tente novamente ou use outro e-mail.',
          });
          return;
        }
        // Sucesso REAL
        localStorage.setItem('pendingCompanyName', name ?? '');
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso!',
          detail: 'Cadastro realizado! Confirme no seu e-mail.',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.hide();
        if (err.status === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro de conexão',
            detail: 'Não foi possível se conectar ao servidor.',
          });
          return;
        }
        // Trate erro 400/409 do Supabase (usuário já existe)
        if (
          err.status === 400 ||
          err.status === 409 ||
          (err.error?.message && err.error.message.toLowerCase().includes('already registered'))
        ) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Usuário já cadastrado',
            detail: 'Já existe uma conta com esse e-mail. Tente recuperar sua senha.',
          });
          return;
        }
        // Erro detalhado
        if (err?.error?.message) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.error.message,
          });
          return;
        }
        // Fallback
        this.messageService.add({
          severity: 'error',
          summary: 'Erro inesperado',
          detail: 'Ocorreu um erro. Tente novamente.',
        });
      },
    });
  }

  get name() {
    return this.signupForm.get('name');
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
    this.passwordTouched = passwordValue.length > 0;

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
