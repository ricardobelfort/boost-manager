import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DashboardCardComponent } from '@shared/components/dashboard-card/dashboard-card.component';
import { Order } from '@shared/models/order.model';
import { OrderService } from '@shared/services/order.service';
import { MenuItem } from 'primeng/api';
import { combineLatest, interval, map, Observable, startWith, switchMap } from 'rxjs';

interface DashboardCard {
  title: string;
  value: number | string;
  subtitleValue?: number | string;
  subtitleText?: string;
  subtitleValueColor?: string;
  subtitleTextColor?: string;
  iconClass?: string;
  iconBgClass?: string;
  valueColor?: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, DashboardCardComponent, CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  orders$: Observable<Order[]> = this.orderService.orders$;
  dollarRate$: Observable<number> = interval(10 * 60 * 1000).pipe(
    startWith(0),
    switchMap(() => this.fetchDollarRate())
  );

  cards$: Observable<DashboardCard[]> = combineLatest([this.orders$, this.dollarRate$]).pipe(
    map(([orders, dollarRate]) => {
      const salesValue = orders.reduce((acc, o) => acc + (o.total_value || 0), 0);
      const salesValueUSD = salesValue / dollarRate;
      return [
        {
          title: 'Revenue',
          value: '$2.100',
          subtitleValue: '%52+',
          subtitleText: 'since last week',
          subtitleValueColor: 'text-emerald-500 font-semibold',
          subtitleTextColor: 'text-gray-400',
          iconClass: 'pi pi-dollar text-orange-500 !text-xl',
          iconBgClass: 'bg-orange-100',
          valueColor: 'text-black',
          route: '/dashboard/revenue',
        },
        {
          title: 'Orders',
          value: 152,
          subtitleValue: '24',
          subtitleText: 'in progress',
          subtitleValueColor: 'text-emerald-500 font-semibold',
          subtitleTextColor: 'text-gray-400',
          iconClass: 'pi pi-shopping-cart text-blue-500 !text-xl',
          iconBgClass: 'bg-blue-100',
          valueColor: 'text-black',
          route: '/dashboard/orders',
        },
        {
          title: 'Customers',
          value: 28441,
          subtitleValue: '520',
          subtitleText: 'newly registered',
          subtitleValueColor: 'text-emerald-500 font-semibold',
          subtitleTextColor: 'text-gray-400',
          iconClass: 'pi pi-users text-cyan-500 !text-xl',
          iconBgClass: 'bg-cyan-100',
          valueColor: 'text-black',
          route: '/dashboard/customers',
        },
        {
          title: 'Payroll Boosters',
          value: '15 boosters',
          subtitleValue: '5',
          subtitleText: 'Payment pending',
          subtitleValueColor: 'text-emerald-500 font-semibold',
          subtitleTextColor: 'text-gray-400',
          iconClass: 'pi pi-calculator text-purple-500 !text-xl',
          iconBgClass: 'bg-purple-100',
          valueColor: 'text-black',
          route: '/dashboard/payroll-boosters',
        },
      ];
    })
  );

  ngOnInit() {
    this.dollarRate$ = this.fetchDollarRate();
  }

  navigateToCard(card: DashboardCard) {
    if (card.route) {
      this.router.navigate([card.route]);
    }
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

  get isRoot() {
    // ajusta conforme seu path
    return this.router.url === '/dashboard' || this.router.url === '/dashboard/';
  }
}
