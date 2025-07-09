import { Injectable } from '@angular/core';
import { Order } from '@shared/models/order.model';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { getSupabaseClient } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();
  private supabase = getSupabaseClient();

  constructor() {
    this.refreshOrders();
  }

  /** Recarrega os Orders do Supabase */
  refreshOrders() {
    from(
      this.supabase.from('orders').select('*').is('deleted_at', null).order('created_at', { ascending: false })
    ).subscribe(({ data }) => {
      if (data) this.ordersSubject.next(data as Order[]);
    });
  }

  addOrder(order: Order): Observable<{ data?: Order; error?: any }> {
    return from(
      this.supabase
        .from('orders')
        .insert(order)
        .select()
        .single()
        .then((res) => {
          if (!res.error) this.refreshOrders();
          return { data: res.data as Order, error: res.error };
        })
    );
  }

  getOrders(): Observable<Order[]> {
    // Você pode usar orders$ ou chamar direto no banco se quiser sempre o mais fresco
    return from(
      this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => data as Order[])
    );
  }

  getOrderById(id: string): Observable<Order | undefined> {
    return from(
      this.supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => data as Order)
    );
  }

  updateOrder(updated: Order): Observable<{ data?: Order; error?: any }> {
    // Só atualiza pedidos que não estão soft deleted (deleted_at IS NULL)
    return from(
      this.supabase
        .from('orders')
        .update(updated)
        .eq('id', updated.id)
        .is('deleted_at', null)
        .select()
        .single()
        .then((res) => {
          if (!res.error) this.refreshOrders();
          return { data: res.data as Order, error: res.error };
        })
    );
  }

  softDeleteOrder(order: Order): Observable<{ data?: any; error?: any }> {
    return from(
      this.supabase
        .from('orders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', order.id)
        .then((res) => {
          if (!res.error) this.refreshOrders();
          return { data: res.data, error: res.error };
        })
    );
  }

  generateOrderNumber(): string {
    // Pode manter localStorage, ou pegar max da tabela via supabase.
    let lastNumber = +(localStorage.getItem('order_number_seq') || '0');
    lastNumber++;
    localStorage.setItem('order_number_seq', lastNumber.toString());
    return lastNumber.toString().padStart(4, '0');
  }

  generateUUID() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : String(1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (parseInt(c, 10) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c, 10) / 4)))).toString(
            16
          )
        );
  }
}
