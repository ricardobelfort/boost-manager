import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Order {
  id: string;
  orderNumber?: string;
  booster: string;
  serviceType: string;
  supplier: string;
  accountEmail: string;
  accountPassword: string;
  recoveryCode1: string;
  recoveryCode2: string;
  startDate: string;
  endDate: string;
  status: string;
  totalValue: number;
  boosterValue: number;
  observation: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private STORAGE_KEY = 'orders';
  private ORDER_NUMBER_KEY = 'order_number_seq';

  // 1. BehaviorSubject para pedidos
  private ordersSubject = new BehaviorSubject<Order[]>(this.getOrdersFromStorage());
  orders$ = this.ordersSubject.asObservable();

  private getOrdersFromStorage(): Order[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  private saveOrdersToStorage(orders: Order[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    this.ordersSubject.next(orders);
  }

  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  getOrdersStream() {
    return this.orders$;
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((order) => order.id === id);
  }

  addOrder(order: Order) {
    if (!order.id) order.id = this.generateUUID();
    const orders = [...this.getOrders(), order];
    this.saveOrdersToStorage(orders);
  }

  updateOrder(updated: Order) {
    const orders = this.getOrders().map((o) => (o.id === updated.id ? updated : o));
    this.saveOrdersToStorage(orders);
  }

  deleteOrder(order: Order) {
    const orders = this.getOrders().filter((o) => o.id !== order.id);
    this.saveOrdersToStorage(orders);
  }

  generateOrderNumber(): string {
    let lastNumber = +(localStorage.getItem(this.ORDER_NUMBER_KEY) || '0');
    lastNumber++;
    localStorage.setItem(this.ORDER_NUMBER_KEY, lastNumber.toString());
    return lastNumber.toString().padStart(4, '0'); // Exemplo: 0001, 0002...
  }

  generateUUID() {
    // (Mantive sua implementação)
    return crypto.randomUUID
      ? crypto.randomUUID()
      : String(1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (parseInt(c, 10) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c, 10) / 4)))).toString(
            16
          )
        );
  }
}
