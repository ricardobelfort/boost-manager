import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { supabase } from 'supabase.client';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div class="w-full max-w-md p-8 rounded-2xl shadow-lg bg-white mt-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2 text-center">Complete seu cadastro</h2>
        <p class="text-gray-500 mb-7 text-center">
          Precisamos de algumas informações adicionais para configurar sua conta.
        </p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
          <div>
            <label class="block mb-1 font-medium text-gray-700">Seu nome</label>
            <input
              formControlName="name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-lime-200 outline-none transition"
            />
          </div>
          <div>
            <label class="block mb-1 font-medium text-gray-700">Nome da empresa/organização</label>
            <input
              formControlName="tenantName"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-lime-200 outline-none transition"
            />
          </div>
          <div *ngIf="error" class="text-red-600 text-sm font-medium mt-2">{{ error }}</div>
          <button
            type="submit"
            [disabled]="loading || form.invalid"
            class="w-full py-2 rounded-lg font-bold bg-lime-500 hover:bg-lime-600 text-white shadow-md transition disabled:opacity-70"
          >
            {{ loading ? 'Processando...' : 'Concluir cadastro' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .onboarding-container {
        max-width: 400px;
        margin: 40px auto;
        background: #fff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 12px #0001;
      }
      .onboarding-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .error {
        color: #d33;
        margin: 0 0 12px 0;
      }
      label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
      }
      input {
        width: 100%;
        padding: 6px 10px;
        border-radius: 5px;
        border: 1px solid #ddd;
      }
      button {
        padding: 10px 0;
        border-radius: 6px;
        font-weight: 600;
      }
    `,
  ],
})
export class OnboardingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    tenantName: ['', [Validators.required, Validators.minLength(2)]],
  });

  loading = false;
  error = '';
  accessToken: string | null = null;

  ngOnInit() {
    // Pega o token da hash da URL: #access_token=...
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        this.accessToken = params.get('access_token');
        if (!this.accessToken) {
          this.router.navigate(['/auth/login']);
        } else {
          sessionStorage.setItem('access_token', this.accessToken);
        }
      } else {
        // Se não tiver fragment, tenta pegar o token da sessão
        this.accessToken = sessionStorage.getItem('access_token');

        // Se não tiver token na sessão, verifica se o usuário está logado
        if (!this.accessToken) {
          supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
              this.router.navigate(['/auth/login']);
            } else {
              // Se estiver logado, usa o token da sessão
              this.accessToken = data.session.access_token;
            }
          });
        }
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const { name, tenantName } = this.form.value;

    try {
      // Verificar se já existe um tenant com o mesmo nome
      const tenantExists = await this.authService.tenantExists(tenantName!);

      if (tenantExists) {
        this.error = 'Uma empresa com esse nome já está registrada. Por favor, escolha outro nome.';
        this.loading = false;
        return;
      }

      // Obter o ID do usuário atual
      const currentUser = this.authService.currentUser;

      if (!currentUser) {
        this.error = 'Usuário não autenticado';
        this.loading = false;
        return;
      }

      // Criar tenant e atualizar perfil
      await this.authService.createTenantAndProfile(tenantName!, name!, currentUser.id);

      // Atualizar o campo onboarding_completed
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Recarregar o perfil do usuário para atualizar o tenant_id
      await this.authService.loadUserProfileAndTenant();

      // Onboarding completo, vá para dashboard!
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err?.message || 'Erro ao concluir onboarding';
    } finally {
      this.loading = false;
    }
  }
}
