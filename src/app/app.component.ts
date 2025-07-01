import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { supabase } from 'supabase.client';
import { APP_VERSION } from '../version';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, LoadingComponent],
  standalone: true,
  template: `
    <div class="flex flex-col min-h-screen">
      <p-toast [showTransitionOptions]="'500ms'" [hideTransitionOptions]="'500ms'" position="top-right" />
      <app-loading />
      <main class="flex-1 flex flex-col justify-center items-center">
        <router-outlet />
      </main>
      <footer
        class="w-full bg-gray-50 border-t border-gray-200 py-4 px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2"
      >
        <div>
          <span class="font-semibold text-gray-700">BoostManager</span>
          &copy; {{ currentYear }}. Todos os direitos reservados.
        </div>
        <div>
          Versão <span class="font-mono bg-gray-100 rounded px-2 py-0.5">{{ APP_VERSION }}</span> | Desenvolvido por
          <a href="https://belfortweb.com.br" target="_blank" class="underline hover:text-green-500">Ricardo Belfort</a>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent {
  currentYear = new Date().getFullYear();
  public APP_VERSION = APP_VERSION;

  constructor(
    private primeng: PrimeNG,
    private router: Router
  ) {}

  async ngOnInit() {
    this.primeng.ripple.set(true);

    const { data, error } = await supabase.auth.getSession();

    if (!data.session && !this.router.url.startsWith('/auth')) {
      // Só redireciona se NÃO estiver já numa rota pública
      this.router.navigate(['/auth/login']);
    }
    // Opcional: escute mudanças na sessão para logout automático!
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
