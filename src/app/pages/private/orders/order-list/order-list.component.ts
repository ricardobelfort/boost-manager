import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Order, OrderService } from '@shared/services/order.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { OrderFormComponent } from '../order-form/order-form.component';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    OrderFormComponent,
    RouterLink,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
  providers: [ConfirmationService],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  search = '';
  showOrderForm = false;
  editingOrder: Order | null = null;

  private orderService = inject(OrderService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  ngOnInit() {
    this.orders = this.orderService.getOrders();
  }

  get filteredOrders() {
    if (!this.search) return this.orders;
    const searchTerm = this.search.toLowerCase();
    return this.orders.filter((o) =>
      Object.values(o).some((value) => String(value).toLowerCase().includes(searchTerm))
    );
  }

  editOrder(order: Order) {
    this.router.navigate(['dashboard/orders/editar', order.id]);
  }

  confirmDelete(order: Order) {
    this.confirmationService.confirm({
      message: 'Deseja realmente excluir este pedido?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteOrder(order);
      },
    });
  }

  deleteOrder(order: Order) {
    this.orders = this.orders.filter((o) => o !== order);
    this.orderService.deleteOrder(order);
    this.messageService.add({
      severity: 'success',
      summary: 'Excluído',
      detail: 'Pedido excluído com sucesso.',
    });
  }

  openOrderForm() {
    this.showOrderForm = true;
  }

  closeOrderForm() {
    this.showOrderForm = false;
  }
}
