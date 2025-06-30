import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.routes').then((r) => r.ordersRoutes),
      },
    ],
  },
];