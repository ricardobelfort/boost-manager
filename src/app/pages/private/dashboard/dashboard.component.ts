import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardCardComponent } from '@shared/components/dashboard-card/dashboard-card.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { OrderService } from '@shared/services/order.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [MenubarComponent, RouterOutlet, DashboardCardComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private orderService = inject(OrderService);

  orders$ = this.orderService.orders$;

  // cards$ é um observable que já traz os valores para o template
  cards$ = this.orders$.pipe(
    map((orders) => [
      {
        title: 'Vendas',
        value: orders
          .reduce((acc, order) => acc + (order.totalValue || 0), 0)
          .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        subtitle: 'Últimos 7 dias',
        iconClass: 'pi pi-money-bill text-lime-500 !text-3xl',
        valueColor: 'text-lime-500',
      },
      {
        title: 'Pedidos',
        value: orders.length,
        subtitle: 'Últimos 7 dias',
        iconClass: 'pi pi-box text-lime-500 !text-3xl',
        valueColor: 'text-lime-500',
      },
      {
        title: 'Clientes',
        value: 0, // Ajuste conforme lógica real de clientes
        subtitle: 'Últimos 7 dias',
        iconClass: 'pi pi-users text-lime-500 !text-3xl',
        valueColor: 'text-lime-500',
      },
    ])
  );
}
