import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { LoadingService } from '@shared/services/loading.service';
import { LockoutService } from '@shared/services/lockout.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { supabase } from 'supabase.client';

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
  private readonly loading = inject(LoadingService);
  private readonly lockout = inject(LockoutService);

  passwordStrengthClass = '';
  passwordStrengthWidth = '0%';
  rememberMe = false;
  lockoutDialogVisible = false;
  lockoutDialogMessage = '';
  lockoutDialogHeader = 'Erro ao autenticar';

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

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all fields correctly.',
      });
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    // 1. Verifica se a conta está bloqueada ANTES de tentar o login
    this.loading.show();
    this.lockout.checkAccountLockout(email!).subscribe({
      next: (lockoutRes) => {
        if (lockoutRes.locked) {
          this.lockoutDialogMessage =
            lockoutRes.message ||
            'Your account has been temporarily locked due to multiple failed login attempts. Please try again after 30 minutes or <a routerLink="/auth/recovery" class="underline text-lime-500">reset your password</a>.';
          this.lockoutDialogVisible = true;
          this.loading.hide();
          return;
        }

        // 2. Se não estiver bloqueada, tenta o login normalmente
        this.auth.signIn(email!, password!, rememberMe ?? false).subscribe({
          next: async (response) => {
            try {
              if (response.error) {
                // 3. Se o login falhar, registra a falha de login
                this.lockout.recordLoginFailure(email!).subscribe();
                this.handleLoginFailure(email!);
                this.setDialogHeaderAndMessage(response.error);
                this.lockoutDialogVisible = true;
                return;
              }

              if (!response.data?.session) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Session not started. Please try again.',
                });
                return;
              }

              // ---- O RESTANTE DO SEU FLUXO AQUI (NÃO MUDEI!) ----
              const user = response.data.session.user;

              const { data: profile } = await supabase
                .from('profiles')
                .select('id, name, email, role, tenant_id')
                .eq('id', user.id)
                .single();

              if (!profile?.name || !profile?.tenant_id || !profile?.role || profile.role === 'user') {
                let tenantId = profile?.tenant_id;
                if (!tenantId) {
                  const companyName = localStorage.getItem('pendingCompanyName') || email || 'My Company';
                  const { data: tenant, error: tenantError } = await supabase
                    .from('tenants')
                    .insert([{ name: companyName }])
                    .select()
                    .single();
                  if (tenantError) {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: tenantError.message || 'Error creating tenant.',
                    });
                    return;
                  }
                  tenantId = tenant.id;
                  localStorage.removeItem('pendingCompanyName');
                }

                const companyName = localStorage.getItem('pendingCompanyName') || email || 'My Company';
                const { error: updateError } = await supabase.rpc('update_profile', {
                  user_name: companyName,
                  user_role: this.auth.isSuperAdminEmail(email!) ? 'superadmin' : 'owner',
                  user_tenant_id: tenantId,
                });
                if (updateError) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: updateError.message || 'Error updating profile.',
                  });
                  return;
                }
              }

              await this.auth.loadUserProfileAndTenant();

              const { data: loadedProfile } = await supabase
                .from('profiles')
                .select('id, name, email, role, tenant_id')
                .eq('id', user.id)
                .single();

              if (loadedProfile?.tenant_id) {
                localStorage.setItem('tenant_id', loadedProfile.tenant_id);
              }

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Welcome, ${email}!`,
              });

              if (await this.auth.isCurrentUserSuperAdmin()) {
                this.router.navigate(['/superadmin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            } finally {
              this.loading.hide();
            }
          },
          error: (err) => {
            this.loading.hide();
            // (opcional) registra falha também aqui em caso de erro de infra
            this.lockout.recordLoginFailure(email!).subscribe();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.message || 'Error communicating with the server.',
            });
          },
        });
      },
      error: (err) => {
        this.loading.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Lockout error',
          detail: err?.message || 'Error checking account status.',
        });
      },
    });
  }

  setDialogHeaderAndMessage(detail: string) {
    const lower = (detail || '').toLowerCase();
    if (lower.includes('already registered') || lower.includes('user already exists')) {
      this.lockoutDialogHeader = 'E-mail já cadastrado';
      this.lockoutDialogMessage = 'Já existe uma conta cadastrada com este e-mail.';
      return;
    }
    if (lower.includes('invalid login credentials')) {
      this.lockoutDialogHeader = 'Credenciais inválidas';
      this.lockoutDialogMessage = 'E-mail ou senha incorretos. Tente novamente.';
      return;
    }
    if (lower.includes('bloquead') || lower.includes('locked')) {
      this.lockoutDialogHeader = 'Conta bloqueada';
      this.lockoutDialogMessage =
        'Sua conta está temporariamente bloqueada devido a múltiplas tentativas de login. Redefina sua senha ou aguarde alguns minutos.';
      return;
    }
    this.lockoutDialogHeader = 'Erro ao autenticar';
    this.lockoutDialogMessage = detail || 'Não foi possível autenticar. Tente novamente.';
  }

  async handleLoginFailure(email: string) {
    // Consulta as tentativas restantes
    const res = await this.auth.getRemainingAttempts(email);
    let msg = 'Usuário ou senha incorretos.';

    if (typeof res.remaining === 'number') {
      if (res.remaining === 0) {
        msg = `Sua conta foi bloqueada por tentativas repetidas. Tente novamente mais tarde ou redefina sua senha.`;
      } else {
        msg += `<br><b>Tentativas restantes:</b> ${res.remaining}`;
      }
    }

    this.lockoutDialogMessage = msg;
    this.lockoutDialogVisible = true;
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

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  showDialog() {
    this.visible = true;
  }

  goToRecovery() {
    this.lockoutDialogVisible = false;
    this.router.navigate(['/auth/recovery']);
  }

  recovery() {
    this.router.navigate(['/auth/recovery']);
  }
}
