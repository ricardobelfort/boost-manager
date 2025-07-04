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
      // Verificar se há um hash na URL (para OAuth)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      // Verificar se há parâmetros de confirmação de e-mail na URL
      const urlParams = new URLSearchParams(window.location.search);
      const confirmationToken = urlParams.get('token') || urlParams.get('confirmation_token');
      const type = urlParams.get('type');

      // Se temos um token de confirmação de e-mail
      if (confirmationToken && (type === 'email' || !type)) {
        // Processar a confirmação de e-mail
        const response = await this.authService.handleEmailConfirmation(confirmationToken).toPromise();

        if (response.error) {
          this.error = response.error.message || 'Erro ao confirmar e-mail. Por favor, tente novamente.';
          return;
        }

        // Se a confirmação foi bem-sucedida, verificar o perfil do usuário
        const profile = await this.authService.loadUserProfileAndTenant();

        if (!profile) {
          this.router.navigate(['/auth/login']);
          return;
        }

        // Verificar se o onboarding foi completado
        if (!profile.onboarding_completed) {
          this.router.navigate(['/onboarding']);
        } else {
          // Se já tiver perfil completo, redirecionar para dashboard
          this.router.navigate(['/dashboard']);
        }
        return;
      }

      // Se temos um token de acesso na URL (OAuth)
      if (accessToken) {
        // Se temos um token na URL, vamos para o onboarding
        // O componente de onboarding já está configurado para pegar o token da URL
        this.router.navigate(['/onboarding']);
        return;
      }

      // Se não temos token na URL, verificamos a sessão atual
      await this.authService.refreshSession();

      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/auth/login']);
        return;
      }

      // Carregar o perfil do usuário e verificar o status de onboarding
      const profile = await this.authService.loadUserProfileAndTenant();

      if (!profile) {
        this.router.navigate(['/auth/login']);
        return;
      }

      // Verificar se o onboarding foi completado
      if (!profile.onboarding_completed) {
        this.router.navigate(['/onboarding']);
      } else {
        // Se já tiver perfil completo, redirecionar para dashboard
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
