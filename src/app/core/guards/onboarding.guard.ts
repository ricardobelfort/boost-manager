import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class OnboardingCompletedGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(): Promise<boolean> {
    // Primeiro verifica se o usuário está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    // Carregar o perfil do usuário
    const profile = await this.authService.getUserProfile();
    
    // Se não tiver perfil ou onboarding não estiver completo, redirecionar para onboarding
    if (!profile || profile.onboarding_completed !== true) {
      this.router.navigate(['/onboarding']);
      return false;
    }

    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class OnboardingGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(): Promise<boolean> {
    // Primeiro verifica se o usuário está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    // Carregar o perfil do usuário
    const profile = await this.authService.getUserProfile();
    
    // Se o onboarding já estiver completo, redirecionar para dashboard
    if (profile?.onboarding_completed === true) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}