import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardCardComponent } from '@shared/components/dashboard-card/dashboard-card.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { OrderService } from '@shared/services/order.service';

@Component({
  selector: 'app-dashboard',
  imports: [MenubarComponent, RouterOutlet, DashboardCardComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);

  ordersCount = 0;
  salesValue = 0;
  clientsCount = 0; // Atualize de acordo com sua lógica de clientes

  ngOnInit() {
    const orders = this.orderService.getOrders();
    this.ordersCount = orders.length;
    // Soma dos valores dos pedidos (ajuste conforme sua lógica de "vendas")
    this.salesValue = orders.reduce((acc, order) => acc + (order.totalValue || 0), 0);
    // Atualize clientsCount se você tiver clientes distintos
  }
}
