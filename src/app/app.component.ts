import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { DialogService } from '@shared/services/dialog.service';
import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { filter } from 'rxjs';
import { getSupabaseClient } from 'supabase.client';
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
      <p-toast
        [showTransitionOptions]="'500ms'"
        [hideTransitionOptions]="'500ms'"
        position="top-right"
        [life]="3000"
        [baseZIndex]="10000"
      />
      <app-loading />

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

      <app-footer *ngIf="!isPublicPage && !isAdminPage" />
      <cc-banner></cc-banner>
    </div>
  `,
})
export class AppComponent {
  isPublicPage = false;
  isAdminPage = false;

  publicPages = [
    '/auth/login',
    '/auth/signup',
    '/auth/recovery',
    '/auth/callback',
    '/onboarding',
    '/privacy',
    '/terms',
  ];

  adminPages = ['/superadmin'];

  constructor(
    private primeng: PrimeNG,
    private router: Router,
    private dialog: DialogService
  ) {}

  async ngOnInit() {
    this.primeng.ripple.set(true);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.isPublicPage = this.publicPages.some((path) => this.router.url.startsWith(path));
      this.isAdminPage = this.adminPages.some((path) => this.router.url.startsWith(path));
    });

    const supabase = getSupabaseClient();

    const { data } = await supabase.auth.getSession();

    if (!data.session && !this.router.url.startsWith('/auth')) {
      // Só redireciona se NÃO estiver já numa rota pública
      this.router.navigate(['/auth/login']);
    }
    // Opcional: escute mudanças na sessão para logout automático!
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        await this.dialog.warning(
          'Session ended',
          'Your session has expired or was ended on another device. Please log in again.'
        );
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
