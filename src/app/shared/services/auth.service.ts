import { inject, Injectable } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';
import { supabase } from 'supabase.client';
import { Md5 } from 'ts-md5';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private tenantId: string | null = null;
  private readonly messageService = inject(MessageService);
  supabase = supabase;

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

  newSignups$ = from(this.supabase.rpc('count_new_signups', { days: 7 })).pipe(map((resp: any) => resp.data || 0));

  // Total de usuários cadastrados
  totalUsers$ = from(this.supabase.rpc('count_users')).pipe(map((resp: any) => resp.data || 0));

  // Falhas de login (exemplo fictício, ajuste para sua lógica)
  loginFailures$ = from(this.supabase.rpc('count_login_failures')).pipe(map((resp: any) => resp.data || 0));

  // Roles disponíveis
  roles$ = from(this.supabase.rpc('count_roles')).pipe(map((resp: any) => resp.data || 0));

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

  signUp(email: string, password: string, redirectTo?: string): Observable<any> {
    const options = redirectTo
      ? { emailRedirectTo: redirectTo }
      : { emailRedirectTo: `${window.location.origin}/auth/callback` };

    return from(
      supabase.auth.signUp({
        email,
        password,
        options,
      })
    );
  }

  handleEmailConfirmation(token: string): Observable<any> {
    return from(
      supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })
    ).pipe(
      tap((response) => {
        if (response.error) {
          console.error('Error confirming email:', response.error);
        } else {
          // Se a confirmação for bem-sucedida, carregue os dados do usuário
          this.loadUserProfileAndTenant();
        }
      })
    );
  }

  async createTenantAndProfile(
    tenantName: string,
    userName: string,
    userId: string,
    userEmail: string
  ): Promise<string> {
    // 1. Criar o tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ name: tenantName }])
      .select('id')
      .single();

    if (tenantError) throw tenantError;
    if (!tenant) throw new Error('Falha ao criar tenant');

    // 2. Verificar se o perfil já existe
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).single();

    // Determinar a role com base no email
    // Se for o email do superadmin, atribuir role 'superadmin', caso contrário 'admin'
    const role = userEmail === 'rbelfort2004@gmail.com' ? 'superadmin' : 'admin';

    if (existingProfile) {
      // 3a. Atualizar o perfil existente
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: userName,
          email: userEmail, // Adicionando o email
          role: role,
          tenant_id: tenant.id,
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    } else {
      // 3b. Criar um novo perfil
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          name: userName,
          email: userEmail, // Adicionando o email
          role: role,
          tenant_id: tenant.id,
        },
      ]);

      if (profileError) throw profileError;
    }

    // Atualizar o tenantId no serviço
    this.tenantId = tenant.id;

    // Retornar a role para que o componente de onboarding saiba para onde redirecionar
    return role;
  }

  // Método para verificar se um email é de superadmin
  isSuperAdminEmail(email: string): boolean {
    // Lista de emails de superadmin
    const superAdminEmails = ['rbelfort2004@gmail.com'];
    return superAdminEmails.includes(email.toLowerCase());
  }

  // Método para verificar se o usuário atual é superadmin
  async isCurrentUserSuperAdmin(): Promise<boolean> {
    try {
      // Se não houver usuário logado, retorna false
      if (!this.currentUser) {
        return false;
      }

      // Busca o perfil do usuário
      const { data, error } = await supabase.from('profiles').select('role').eq('id', this.currentUser.id).single();

      if (error || !data) {
        console.error('Error checking if user is superadmin:', error);
        return false;
      }

      return data.role === 'superadmin';
    } catch (error) {
      console.error('Error checking if user is superadmin:', error);
      return false;
    }
  }

  // Método para obter a role do usuário atual
  async getUserRole(): Promise<string | null> {
    try {
      // Se não houver usuário logado, retorna null
      if (!this.currentUser) {
        return null;
      }

      // Busca o perfil do usuário
      const { data, error } = await supabase.from('profiles').select('role').eq('id', this.currentUser.id).single();

      if (error || !data) {
        console.error('Error getting user role:', error);
        return null;
      }

      return data.role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  async getUserProfile() {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.user.id).single();
    return data;
  }

  async getUserTenant() {
    const profile = await this.getUserProfile();
    if (!profile?.tenant_id) return null;

    const { data, error } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).single();

    if (error) {
      console.error('Erro ao obter tenant:', error);
      return null;
    }

    return data;
  }

  getGravatarUrl(email: string, size: number = 80) {
    const hash = Md5.hashStr(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  }

  recoverPassword(email: string): Observable<any> {
    return from(supabase.auth.resetPasswordForEmail(email));
  }
}
