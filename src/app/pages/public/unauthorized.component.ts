import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="w-full h-full flex justify-center items-center">
      <div class="bg-white rounded-md shadow-xs p-10 flex flex-col items-center text-center gap-3">
        <img src="assets/images/access-denied.png" width="128" alt="" />
        <h2 class="text-3xl font-bold">Acesso Negado</h2>
        <p class="mb-4">Você não tem permissão para acessar esta página.</p>
        <p-button label="Voltar ao login" icon="pi pi-arrow-left" (onClick)="goBack()" />
      </div>
    </div>
  `,
  imports: [ButtonModule, RouterModule],
})
export class UnauthorizedComponent {
  private router = inject(Router);

  goBack(): void {
    this.router.navigate(['/']);
  }
}
