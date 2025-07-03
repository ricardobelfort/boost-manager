import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs';
import { supabase } from 'supabase.client';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MenubarComponent } from './shared/components/menubar/menubar.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastModule, LoadingComponent, MenubarComponent, FooterComponent],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="w-full flex flex-col min-h-screen">
      <app-menubar *ngIf="!isPublicPage && !isAdminPage"></app-menubar>
      <p-toast [showTransitionOptions]="'500ms'" [hideTransitionOptions]="'500ms'" position="top-center" />
      <app-loading *ngIf="!isPublicPage && !isAdminPage" />

      <main class="flex-1 w-full bg-[#f7f9fc]">
        <div
          [class]="
            isPublicPage
              ? 'flex flex-col justify-center items-center h-full'
              : isAdminPage
                ? 'w-full min-h-screen'
                : 'max-w-[1280px] mx-auto px-4 py-8'
          "
        >
          <router-outlet />
        </div>
      </main>

      <cc-banner></cc-banner>
      <app-footer *ngIf="!isPublicPage && !isAdminPage" />
    </div>
  `,
})
export class AppComponent {
  isPublicPage = false;
  isAdminPage = false;

  publicPages = ['/auth/login', '/auth/signup', '/auth/recovery'];
  adminPages = ['/superadmin'];

  constructor(
    private primeng: PrimeNG,
    private router: Router
  ) {}

  async ngOnInit() {
    this.primeng.ripple.set(true);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isPublicPage = this.publicPages.some((path) => this.router.url.startsWith(path));
      this.isAdminPage = this.adminPages.some((path) => this.router.url.startsWith(path));
    });

    const { data } = await supabase.auth.getSession();

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
