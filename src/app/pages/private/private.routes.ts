import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PayrollBoostersComponent } from './payroll-boosters/payroll-boosters.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard' },
    children: [
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.routes').then((r) => r.ordersRoutes),
      },
      {
        path: 'payroll-boosters',
        component: PayrollBoostersComponent,
        data: { title: 'Payrool Boosters' },
      },
    ],
  },
];