import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DashboardCardComponent } from '@shared/components/dashboard-card/dashboard-card.component';
import { Order } from '@shared/models/order.model';
import { OrderService } from '@shared/services/order.service';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
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

export interface OrderInProgress {
  boosterName: string;
  serviceName: string;
  progress: number;
  progressLabel: string;
  readonly progressBarColor: string;
  readonly progressColor: string;
  startedAt: Date;
  concluding: boolean;
  concluded: boolean;
  timeOpen?: Observable<string>;
  finishedTime?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, DashboardCardComponent, CommonModule, RouterLink, TableModule, ButtonModule, TooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private orderService = inject(OrderService);
  private router = inject(Router);

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  activeBoosters = [
    {
      orderId: 1,
      name: 'Matheus',
      boosterId: '123',
      amount: 350,
      avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png',
    },
    {
      orderId: 2,
      name: 'Murillo',
      boosterId: '123',
      amount: 425,
      avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',
    },
    {
      orderId: 3,
      name: 'Erick',
      boosterId: '123',
      amount: 850,
      avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png',
    },
  ];

  ordersInProgress: OrderInProgress[] = [
    {
      boosterName: 'Matheus',
      serviceName: 'Valorant Boost - Platinum I',
      progress: 68,
      progressLabel: '%68',
      get progressBarColor() {
        if (this.progress < 40) return 'bg-red-400';
        if (this.progress < 70) return 'bg-yellow-400';
        return 'bg-green-400';
      },
      get progressColor() {
        if (this.progress < 40) return 'text-red-500';
        if (this.progress < 70) return 'text-yellow-500';
        return 'text-green-500';
      },
      startedAt: new Date(Date.now() - 2 * 3600 * 1000 - 23 * 60 * 1000 - 12 * 1000),

      concluding: false,
      concluded: false,
    },
    {
      boosterName: 'Murillo',
      serviceName: 'LoL Boost - Gold IV',
      progress: 35,
      progressLabel: '%35',
      get progressBarColor() {
        if (this.progress < 40) return 'bg-red-400';
        if (this.progress < 70) return 'bg-yellow-400';
        return 'bg-green-400';
      },
      get progressColor() {
        if (this.progress < 40) return 'text-red-500';
        if (this.progress < 70) return 'text-yellow-500';
        return 'text-green-500';
      },
      startedAt: new Date(Date.now() - 2 * 3600 * 1000 - 23 * 60 * 1000 - 12 * 1000),
      concluding: false,
      concluded: false,
    },
    {
      boosterName: 'Erick',
      serviceName: 'LoL Boost - Gold IV',
      progress: 85,
      progressLabel: '%85',
      get progressBarColor() {
        if (this.progress < 40) return 'bg-red-400';
        if (this.progress < 70) return 'bg-yellow-400';
        return 'bg-green-400';
      },
      get progressColor() {
        if (this.progress < 40) return 'text-red-500';
        if (this.progress < 70) return 'text-yellow-500';
        return 'text-green-500';
      },
      startedAt: new Date(Date.now() - 2 * 3600 * 1000 - 23 * 60 * 1000 - 12 * 1000),
      concluding: false,
      concluded: false,
    },
  ];

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
    this.ordersInProgress.forEach((order) => {
      order.timeOpen = interval(1000).pipe(
        startWith(0),
        map(() => this.getElapsedTimeString(order.startedAt))
      );
    });
  }

  startConclude(row: any) {
    row.concluding = true;
    setTimeout(() => {
      row.concluding = false;
      row.concluded = true;
      row.progress = 100;
      row.progressLabel = '%100';
      // Pega o valor exibido no timer no momento da conclusão
      // Se você usa async pipe, precisa "pegar" o último valor emitido:
      row.timeOpen
        ?.subscribe((timerVal: string) => {
          row.finishedTime = timerVal;
        })
        .unsubscribe(); // cancela logo depois de pegar o valor atual
    }, 1500);
  }

  viewBoosterReport(row: any) {
    // Troque 'boosterId' pela propriedade correta do seu objeto!
    if (!row.boosterId) {
      alert('BoosterId is missing!');
      return;
    }
    this.router.navigate(['/dashboard/booster-report', row.boosterId]);
  }

  getElapsedTimeString(startedAt: Date): string {
    const now = new Date();
    const diff = Math.floor((+now - +new Date(startedAt)) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
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
