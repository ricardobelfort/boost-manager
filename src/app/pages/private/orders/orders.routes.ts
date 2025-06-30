import { Routes } from '@angular/router';
import { OrderFormComponent } from './order-form/order-form.component';
import { OrderListComponent } from './order-list/order-list.component';

export const ordersRoutes: Routes = [
  { path: '', component: OrderListComponent },
  { path: 'novo', component: OrderFormComponent },
  { path: 'editar/:id', component: OrderFormComponent },
];