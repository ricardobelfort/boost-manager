import { Component } from '@angular/core';
import { MenuItem } from 'node_modules/primeng/api/menuitem';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [MenubarModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  items: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.items = [
      { label: 'Dashboard', icon: 'pi pi-th-large' },
      { label: 'Pedidos', icon: 'pi pi-box' },
      { label: 'Fornecedores', icon: 'pi pi-inbox' },
      { label: 'Clientes', icon: 'pi pi-users' },
    ];
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
