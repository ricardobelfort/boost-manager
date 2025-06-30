import { Routes } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderFormComponent } from './order-form/order-form.component';

export const ordersRoutes: Routes = [
  { path: '', component: OrderListComponent },
  { path: 'novo', component: OrderFormComponent },
];