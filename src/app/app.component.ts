import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs';
import { supabase } from 'supabase.client';
import { APP_VERSION } from '../version';
import { MenubarComponent } from './shared/components/menubar/menubar.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastModule, LoadingComponent, MenubarComponent],
  standalone: true,
  template: `
    <div class="w-full flex flex-col min-h-screen">
      <ng-container *ngIf="!isPublicPage">
        <app-menubar></app-menubar>
        <p-toast [showTransitionOptions]="'500ms'" [hideTransitionOptions]="'500ms'" position="top-right" />
        <app-loading />
      </ng-container>
      <main
        [class]="
          isPublicPage ? 'flex-1 flex flex-col justify-center items-center bg-[#f7f9fc]' : 'max-w-[1280px] mx-auto px-4'
        "
      >
        <router-outlet />
      </main>
      <ng-container *ngIf="!isPublicPage">
        <footer
          class="w-full bg-gray-50 border-t border-gray-200 py-4 px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2"
        >
          <div>
            <span class="font-semibold text-gray-700">BoostManager</span>
            &copy; {{ currentYear }}. Todos os direitos reservados.
          </div>
          <div>
            Versão <span class="font-mono bg-gray-100 rounded px-2 py-0.5">{{ APP_VERSION }}</span> | Desenvolvido por
            <a href="https://belfortweb.com.br" target="_blank" class="underline hover:text-green-500"
              >Ricardo Belfort</a
            >
          </div>
        </footer>
      </ng-container>
    </div>
  `,
})
export class AppComponent {
  isPublicPage = false;
  currentYear = new Date().getFullYear();
  public APP_VERSION = APP_VERSION;

  publicPages = ['/auth/login', '/auth/signup', '/auth/recovery'];

  constructor(
    private primeng: PrimeNG,
    private router: Router
  ) {}

  async ngOnInit() {
    this.primeng.ripple.set(true);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isPublicPage = this.publicPages.some((path) => this.router.url.startsWith(path));
    });

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
