import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { APP_VERSION } from 'src/version';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  standalone: true,
  template: `
    <footer
      *ngIf="!isPublicPage"
      class="w-full bg-gray-50 border-t border-gray-200 py-4 px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-2"
    >
      <div>
        <span class="font-semibold text-gray-700">BoostManager</span>
        &copy; {{ currentYear }}. All rights reserved. |
        <a routerLink="/privacy" class="underline hover:text-lime-500 cursor-pointer">Privacy Policies</a> |
        <a routerLink="/terms" class="underline hover:text-lime-500 cursor-pointer">Terms of Use</a>
      </div>
      <div>
        Version <span class="font-mono bg-gray-100 rounded px-2 py-0.5">{{ APP_VERSION }}</span> | Designed by
        <a href="https://belfortweb.com.br" target="_blank" class="underline hover:text-green-500">Ricardo Belfort</a>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  public APP_VERSION = APP_VERSION;

  constructor(private router: Router) {}

  get isPublicPage(): boolean {
    // Ajuste as rotas conforme seu projeto!
    return ['/auth/login', '/auth/signup', '/auth/recovery'].includes(this.router.url);
  }
}
