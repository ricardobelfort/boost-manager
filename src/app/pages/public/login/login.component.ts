import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { LoadingService } from '@shared/services/loading.service';
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

  private async ensureProfileAndTenant(email: string, name: string, userId: string) {
    // Busca ou cria profile, cria tenant e associa ao profile, se necessário
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (!profile) {
      // Cria o profile se não existir
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: userId,
          email,
          name,
          role: email === 'rbelfort2004@gmail.com' ? 'superadmin' : 'owner',
          tenant_id: null,
        },
      ]);
      if (insertError) throw insertError;
      // reconsulta
      ({ data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle());
    }

    // Cria o tenant se não houver
    if (!profile?.tenant_id || !profile.role || !profile.name) {
      const companyName = localStorage.getItem('pendingCompanyName') || email || 'My Company';
      // Só cria tenant se não houver
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert([{ name: companyName }])
        .select()
        .single();
      if (tenantError) throw tenantError;

      // Atualiza o profile com o tenant criado
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: companyName,
          tenant_id: tenantData.id,
          role: email === 'rbelfort2004@gmail.com' ? 'superadmin' : 'owner',
        })
        .eq('id', userId);

      if (updateError) throw updateError;
      localStorage.removeItem('pendingCompanyName');
    }
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
    this.loading.show();

    this.auth.signIn(email!, password!, rememberMe ?? false).subscribe({
      next: async (response) => {
        try {
          if (response.error) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.error.message || 'Invalid email or password.',
            });
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

          const user = response.data.session.user;

          // 1. Busca o profile do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, email, role, tenant_id')
            .eq('id', user.id)
            .single();

          // 2. Verifica se falta completar (nome, tenant, role)
          if (!profile?.name || !profile?.tenant_id || !profile?.role || profile.role === 'user') {
            // 3. Cria tenant, se necessário
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

            // 4. Atualize o profile via RPC (opção 1 Supabase)
            const companyName = localStorage.getItem('pendingCompanyName') || email || 'My Company';
            const { error: updateError } = await supabase.rpc('update_profile', {
              user_name: companyName,
              user_role: email === 'rbelfort2004@gmail.com' ? 'superadmin' : 'owner',
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

          // Carrega novamente o profile atualizado
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

          if (loadedProfile?.role === 'superadmin') {
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.message || 'Error communicating with the server.',
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

  recovery() {
    this.router.navigate(['/auth/recovery']);
  }
}
