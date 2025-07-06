import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { getSupabaseClient } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class TenantGuard implements CanActivate {
  private supabase = getSupabaseClient();
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    // Pega o usuário logado
    const { data: userData } = await this.supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Busca o profile
    const { data: profile, error } = await this.supabase.from('profiles').select('role').eq('id', userId).single();

    if (error || !profile) {
      // Não achou o perfil ou deu erro: força logout
      await this.supabase.auth.signOut();
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Se for superadmin, bloqueia acesso ao dashboard de tenant
    if (profile.role === 'superadmin') {
      this.router.navigate(['/superadmin']);
      return false;
    }

    // Qualquer outro papel, permite
    return true;
  }
}
