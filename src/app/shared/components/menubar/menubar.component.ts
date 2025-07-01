import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { MenuItem } from 'node_modules/primeng/api/menuitem';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-menubar',
  imports: [CommonModule, MenubarModule, Menu, ButtonModule],
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.css',
})
export class MenubarComponent {
  items: MenuItem[] | undefined;
  profileItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.items = [
      { label: 'Home', icon: 'pi pi-th-large' },
      { label: 'Pedidos', icon: 'pi pi-box' },
      { label: 'Fornecedores', icon: 'pi pi-inbox' },
      { label: 'Relatórios', icon: 'pi pi-chart-line' },
    ];

    this.profileItems = [
      {
        label: 'Perfil',
        items: [
          {
            label: 'Minha Conta',
            icon: 'pi pi-user',
          },
          {
            label: 'Configurações',
            icon: 'pi pi-cog',
          },
          {
            separator: true,
          },
          {
            label: 'Sair',
            icon: 'pi pi-sign-out',
            command: () => {
              this.auth.signOut().subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Logout',
                    detail: 'Você saiu da sua conta com sucesso!',
                  });
                  this.router.navigate(['/auth/login']);
                },
                error: (err) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao sair',
                    detail: err?.message || 'Falha ao encerrar sessão. Tente novamente.',
                  });
                  this.router.navigate(['/auth/login']);
                },
              });
            },
          },
        ],
      },
    ];
  }
}
