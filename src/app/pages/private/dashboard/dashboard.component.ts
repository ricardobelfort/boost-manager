import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardCardComponent } from '@shared/components/dashboard-card/dashboard-card.component';
import { Order } from '@shared/models/order.model';
import { OrderService } from '@shared/services/order.service';
import { combineLatest, interval, map, Observable, startWith, switchMap } from 'rxjs';

interface DashboardCard {
  title: string;
  value: string | number;
  subtitle: string;
  iconClass: string;
  valueColor: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, DashboardCardComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private orderService = inject(OrderService);
  private http = inject(HttpClient);

  orders$: Observable<Order[]> = this.orderService.orders$;
  dollarRate$: Observable<number> = interval(10 * 60 * 1000) // 10 minutos em ms
    .pipe(
      startWith(0),
      switchMap(() => this.fetchDollarRate())
    );

  cards$: Observable<DashboardCard[]> = combineLatest([this.orders$, this.dollarRate$]).pipe(
    map(([orders, dollarRate]) => {
      const salesValue = orders.reduce((acc, o) => acc + (o.total_value || 0), 0);
      const salesValueUSD = salesValue / dollarRate;
      return [
        {
          title: 'Vendas',
          value: 'R$ ' + salesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          subtitle: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(salesValueUSD),
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
          value: 0,
          subtitle: 'Últimos 7 dias',
          iconClass: 'pi pi-users text-lime-500 !text-3xl',
          valueColor: 'text-lime-500',
        },
      ];
    })
  );

  // Para buscar a cotação em tempo real:
  ngOnInit() {
    this.dollarRate$ = this.fetchDollarRate();
  }

  fetchDollarRate(): Observable<number> {
    return new Observable((observer) => {
      fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
        .then((res) => res.json())
        .then((data) => {
          // AwesomeAPI devolve a cotação assim:
          // data['USDBRL'].bid (valor do DÓLAR EM REAL, ex: 5.45)
          const bid = data?.USDBRL?.bid;
          if (bid) {
            observer.next(Number(bid));
          } else {
            observer.next(5.4); // fallback
          }
          observer.complete();
        })
        .catch(() => {
          observer.next(5.4); // fallback
          observer.complete();
        });
    });
  }
}
