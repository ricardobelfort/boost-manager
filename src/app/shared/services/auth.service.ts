import { inject, Injectable } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { supabase } from 'supabase.client';
import { Md5 } from 'ts-md5';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private tenantId: string | null = null;
  private readonly messageService = inject(MessageService);

  constructor() {
    // Restaura a sessão ao iniciar o app
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.sessionSubject.next(session);
    });

    // Observa mudanças de autenticação
    supabase.auth.onAuthStateChange((_event, session) => {
      this.sessionSubject.next(session);
    });
  }

  /** Observable da sessão para uso reativo na app */
  session$ = this.sessionSubject.asObservable();

  /** Getter do usuário atual (null se deslogado) */
  get currentUser(): User | null {
    return this.sessionSubject.value?.user ?? null;
  }

  /** Getter da sessão atual */
  get currentSession(): Session | null {
    return this.sessionSubject.value;
  }

  /** Getter para o tenantId */
  get currentTenantId(): string | null {
    return this.tenantId;
  }

  /** Setter público se quiser atualizar manualmente (opcional) */
  set currentTenantId(value: string | null) {
    this.tenantId = value;
  }

  /** Efetua login com persistência de sessão */
  signIn(email: string, password: string, rememberMe: boolean): Observable<any> {
    // Opção nativa do Supabase
    return from(
      supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // O persistSession funciona para web. 'local' para localStorage, 'session' para sessionStorage.
          persistSession: rememberMe ? 'local' : 'session',
        } as any, // "as any" pois typescript v2 ainda não aceita string, mas funciona
      })
    );
  }

  async loadUserProfileAndTenant() {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return null;
    const { data: profile } = await supabase.from('profiles').select('*, tenant_id').eq('id', user.user.id).single();
    this.tenantId = profile?.tenant_id ?? null;
    console.log('[DEBUG] tenantId carregado:', this.tenantId);
    return profile;
  }

  /** Desloga o usuário */
  signOut(): Observable<void> {
    return from(
      supabase.auth.signOut().then(() => {
        this.sessionSubject.next(null);
      })
    );
  }

  /** Verifica se está logado (atual e reativo) */
  isLoggedIn(): boolean {
    return !!this.sessionSubject.value;
  }

  /** Restaura/atualiza sessão manualmente, se necessário */
  refreshSession(): Promise<Session | null> {
    return supabase.auth.getSession().then(({ data }) => {
      this.sessionSubject.next(data.session);
      return data.session;
    });
  }

  // auth.service.ts
  // ...
  signUp(email: string, password: string) {
    // Só registra o usuário no Auth
    return from(supabase.auth.signUp({ email, password }));
  }

  // Cria tenant e profile DEPOIS do login (quando session ativa)
  async createTenantAndProfile(name: string, email: string, userId: string) {
    // 1. Cria o tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ name }])
      .select()
      .single();

    if (tenantError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: tenantError.message || 'Tenant creation error.',
      });
      throw tenantError;
    }

    // 2. Busca se já existe o profile
    const { data: existingProfile, error: profileSelectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileSelectError && profileSelectError.code !== 'PGRST116') {
      // PGRST116 = no rows found (ok se não existe ainda)
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: profileSelectError.message || 'Profile select error.',
      });
      throw profileSelectError;
    }

    let profileResp;
    if (existingProfile) {
      // UPDATE profile existente
      profileResp = await supabase
        .from('profiles')
        .update({
          name,
          email,
          role: 'owner', // aqui pode ser 'superadmin' para você!
          tenant_id: tenantData.id,
        })
        .eq('id', userId);
    } else {
      // INSERT profile se não existir
      profileResp = await supabase.from('profiles').insert([
        {
          id: userId,
          name,
          email,
          role: 'owner',
          tenant_id: tenantData.id,
        },
      ]);
    }

    if (profileResp.error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: profileResp.error.message || 'Profile upsert error.',
      });
      throw profileResp.error;
    }

    return { tenant: tenantData, profile: profileResp.data };
  }

  async getUserProfile() {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.user.id).single();
    return data;
  }

  async getUserRole() {
    const profile = await this.getUserProfile();
    return profile?.role ?? null;
  }

  getGravatarUrl(email: string, size: number = 80) {
    const hash = Md5.hashStr(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  }

  recoverPassword(email: string): Observable<any> {
    return from(supabase.auth.resetPasswordForEmail(email));
  }
}
