import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
  private router = inject(Router);
  private messageService = inject(MessageService);

  async canActivate(): Promise<boolean> {
    try {
      // Checa session usando o método existente
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
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();

      if (error || !data) {
        this.messageService.add({
          severity: 'error',
          summary: 'Acesso negado',
          detail: 'Não foi possível verificar suas permissões',
        });
        this.router.navigate(['/dashboard']);
        return false;
      }

      // Só libera se for superadmin
      if (data.role === 'superadmin') {
        return true;
      } else {
        // Adiciona mensagem de erro
        this.messageService.add({
          severity: 'error',
          summary: 'Acesso negado',
          detail: 'Você não tem permissão para acessar esta área',
        });
        // Redireciona para dashboard padrão se não for superadmin
        this.router.navigate(['/dashboard']);
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar permissões de superadmin:', error);
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
