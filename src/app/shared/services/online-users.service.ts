import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class OnlineUsersService {
  onlineUsers$ = new BehaviorSubject<number>(0);

  constructor() {
    // Atualiza a cada 10 segundos
    timer(0, 10000).pipe(
      switchMap(() =>
        supabase
          .from('profiles')
          .select('id,last_seen')
          .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      )
    ).subscribe(({ data }) => {
      this.onlineUsers$.next(data?.length || 0);
    });

    // Realtime updates (escuta updates em profiles)
    supabase
      .channel('online-users')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
        // Você pode chamar de novo a query acima aqui, se quiser atualização ainda mais real-time
      })
      .subscribe();
  }
}
