import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    // Checa se há session no localStorage
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Faz uma chamada para garantir que o token é válido e usuário existe
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      // Remove local session, força logout!
      await supabase.auth.signOut();
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
