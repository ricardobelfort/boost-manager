import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  imports: [CommonModule],
  template: `
    <div class="auth-callback-container">
      <div *ngIf="loading" class="loading-state">
        <h2>Autenticando...</h2>
        <div class="loading-spinner"></div>
      </div>

      <div *ngIf="error" class="error-state">
        <h2>Erro de Autenticação</h2>
        <p>{{ error }}</p>
        <button (click)="navigateToLogin()">Voltar para o Login</button>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-callback-container {
        max-width: 400px;
        margin: 40px auto;
        text-align: center;
        padding: 24px;
      }
      .loading-spinner {
        width: 40px;
        height: 40px;
        margin: 20px auto;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .error-state {
        background: #fff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 12px #0001;
      }
      button {
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        background: #3498db;
        color: white;
        border: none;
        cursor: pointer;
      }
    `,
  ],
})
export class AuthCallbackComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.handleAuthCallback();
  }

  async handleAuthCallback(): Promise<void> {
    try {
      // 1. Confirmação de e-mail
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const urlParams = new URLSearchParams(window.location.search);
      const confirmationToken = urlParams.get('token') || urlParams.get('confirmation_token');
      const type = urlParams.get('type');

      // CONFIRMAÇÃO DE EMAIL
      if (confirmationToken && (type === 'email' || !type)) {
        const response = await this.authService.handleEmailConfirmation(confirmationToken).toPromise();

        if (response.error) {
          this.error = response.error.message || 'Erro ao confirmar e-mail. Por favor, tente novamente.';
          return;
        }
        // Após confirmar o e-mail, força refresh da sessão
        await this.authService.refreshSession();
      }

      // SE HOUVER TOKEN DE ACESSO (OAuth ou link mágico)
      let currentAccessToken = accessToken;
      if (!currentAccessToken) {
        // Garante que a sessão está atualizada e pega o access_token
        const session = await this.authService.refreshSession();
        currentAccessToken = session?.access_token || '';
      }

      if (!currentAccessToken) {
        // Não está autenticado
        this.router.navigate(['/auth/login']);
        return;
      }

      // CHAMA EDGE FUNCTION PARA SABER PRA ONDE VAI
      const resp = await fetch('https://nqaipmnlcoioqqqzcghu.supabase.co/functions/v1/check-new-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: currentAccessToken }),
      });
      const result = await resp.json();

      if (result.error) {
        this.error = result.error || 'Erro ao validar usuário.';
        return;
      }

      // Redireciona conforme resposta do backend
      if (result.shouldRedirect) {
        this.router.navigate(['/onboarding']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      console.error('Erro no callback de autenticação:', error);
      this.error = 'Ocorreu um erro durante a autenticação. Por favor, tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
