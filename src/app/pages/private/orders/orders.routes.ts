import { Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';
import { OrderListComponent } from './order-list/order-list.component';

export const ordersRoutes: Routes = [
  {
    path: '',
    component: OrderListComponent,
    data: {
      breadcrumb: 'Orders',
    },
  },
  {
    path: 'new',
    component: OrderFormComponent,
    data: {
      breadcrumb: 'New order',
    },
  },
  {
    path: 'edit/:id',
    component: OrderFormComponent,
    data: {
      breadcrumb: 'Editing order',
    },
  },
];
