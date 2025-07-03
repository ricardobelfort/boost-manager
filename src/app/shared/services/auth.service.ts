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

  // Só registra o usuário no Auth
  signUp(email: string, password: string) {
    return from(supabase.auth.signUp({ email, password }));
  }

  async createTenantAndProfile(name: string, email: string, userId: string) {
    // 1. Verifica se já existe um tenant com o mesmo nome
    const { data: existingTenant, error: lookupTenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (lookupTenantError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error verifying name.',
      });
      throw lookupTenantError;
    }

    if (existingTenant) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Name already exists',
        detail: 'A company with that name is already registered. Please choose another one.',
      });
      throw new Error('Tenant name already exists');
    }

    // 2. Verifica se já existe e-mail na tabela de profiles (além do auth)
    const { data: existingProfile, error: lookupEmailError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (lookupEmailError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error verifying email.',
      });
      throw lookupEmailError;
    }

    if (existingProfile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email already exists',
        detail: 'A registration with this email already exists. Try to recover the password or use another email.',
      });
      throw new Error('Email already exists');
    }

    // 3. Cria tenant normalmente se não existe
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

    // 4. Garante que existe profile antes de atualizar
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();

    if (!profile) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Profile not found after registration. Please try again or contact support.',
      });
      throw new Error('Profile not found!');
    }

    // 5. Atualiza o profile vinculado ao tenant!
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        email,
        role: email === 'rbelfort2004@gmail.com' ? 'superadmin' : 'owner',
        name,
        tenant_id: tenantData.id,
      })
      .eq('id', userId);

    if (profileError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: profileError.message || 'Error updating profile.',
      });
      throw profileError;
    }

    return { tenant: tenantData };
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
