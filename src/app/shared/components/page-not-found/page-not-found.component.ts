// page-not-found.component.ts

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col min-h-[60vh] items-center justify-center py-16 bg-gray-50">
      <div class="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center max-w-lg w-full">
        <div class="m-6">
          <i class="pi pi-face-smile text-lime-500" style="font-size: 5rem;"></i>
        </div>
        <h1 class="text-5xl font-extrabold text-gray-800 mb-2">404</h1>
        <h2 class="text-2xl font-bold text-gray-700 mb-4">Page Not Found</h2>
        <p class="text-gray-500 mb-8 text-center">
          Sorry, the page you are looking for doesn't exist.<br />
          Or, this feature is <span class="font-semibold text-lime-500">coming soon!</span>
        </p>
        <a
          routerLink="/dashboard"
          class="bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl px-6 py-2 transition-all duration-200 shadow-md"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  `,
})
export class PageNotFoundComponent {}
