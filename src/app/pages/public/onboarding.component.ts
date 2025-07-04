import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { LoadingService } from '@shared/services/loading.service';
import { MessageService } from 'primeng/api';
import { supabase } from 'supabase.client';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
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
            [disabled]="form.invalid"
            class="w-full py-2 rounded-lg font-bold bg-lime-500 hover:bg-lime-600 text-white shadow-md transition disabled:opacity-70 cursor-pointer"
          >
            Concluir cadastro
          </button>
        </form>
      </div>
    </div>
  `,
})
export class OnboardingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly loadingService = inject(LoadingService);
  private readonly messageService = inject(MessageService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    tenantName: ['', [Validators.required, Validators.minLength(2)]],
  });

  error = '';
  accessToken: string | null = null;

  ngOnInit() {
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
        this.accessToken = sessionStorage.getItem('access_token');
        if (!this.accessToken) {
          supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
              this.router.navigate(['/auth/login']);
            } else {
              this.accessToken = data.session.access_token;
            }
          });
        }
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loadingService.show();
    this.error = '';

    const { name, tenantName } = this.form.value;

    try {
      const tenantExists = await this.authService.tenantExists(tenantName!);

      if (tenantExists) {
        this.error = 'A company with that name is already registered. Please choose another name.';
        this.loadingService.hide();
        return;
      }

      const currentUser = this.authService.currentUser;

      if (!currentUser) {
        this.error = 'Unauthenticated user';
        this.loadingService.hide();
        return;
      }

      await this.authService.createTenantAndProfile(tenantName!, name!, currentUser.id);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      await this.authService.loadUserProfileAndTenant();
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Error completing onboarding.',
      });
      this.error = err?.message || 'Error completing onboarding';
    } finally {
      this.loadingService.hide();
    }
  }
}
