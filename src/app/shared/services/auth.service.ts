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

  signOut(): Observable<void> {
    return from(
      supabase.auth.signOut().then(() => {
        this.sessionSubject.next(null);
      })
    );
  }

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

  async tenantExists(name: string): Promise<boolean> {
    const { data } = await supabase.from('tenants').select('id').eq('name', name).maybeSingle();
    return !!data;
  }

  async emailExists(email: string): Promise<boolean> {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
    return !!data;
  }

  signUp(email: string, password: string) {
    return from(supabase.auth.signUp({ email, password }));
  }

  async createTenantAndProfile(tenantName: string, userName: string, userId: string): Promise<void> {
    // 1. Criar o tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([
        {
          name: tenantName,
          // Adicione outros campos necessários para o tenant
        },
      ])
      .select('id')
      .single();

    if (tenantError) throw tenantError;

    if (!tenant) throw new Error('Failed to create tenant');

    // 2. Verificar se o perfil já existe
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).single();

    if (existingProfile) {
      // 3a. Atualizar o perfil existente
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: userName,
          role: 'owner',
          tenant_id: tenant.id,
          // Não incluir updated_at, deixe o trigger do Postgres lidar com isso
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    } else {
      // 3b. Criar um novo perfil
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          name: userName,
          role: 'owner',
          tenant_id: tenant.id,
          // Não incluir updated_at, deixe o trigger do Postgres lidar com isso
        },
      ]);

      if (profileError) throw profileError;
    }
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
