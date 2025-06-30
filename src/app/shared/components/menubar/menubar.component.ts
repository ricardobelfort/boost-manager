import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'node_modules/primeng/api/menuitem';
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

  constructor(private router: Router) {}

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
              this.router.navigate(['/login']);
            }
          },
        ],
      },
    ];
  }
}
