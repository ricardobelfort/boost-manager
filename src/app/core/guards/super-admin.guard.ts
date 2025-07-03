import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    // Checa session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Obtém o id do usuário logado
    const userId = session.user.id;

    // Busca o perfil desse usuário na tabela 'profiles'
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Só libera se for superadmin
    if (data.role === 'superadmin') {
      return true;
    } else {
      // Redireciona para dashboard padrão se não for superadmin
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
