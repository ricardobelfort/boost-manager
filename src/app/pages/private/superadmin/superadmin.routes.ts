import { Routes } from '@angular/router';
import { SuperAdminGuard } from '@core/guards/super-admin.guard';
import { SuperadminDashboardComponent } from './superadmin-dashboard/superadmin-dashboard.component';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    component: SuperadminDashboardComponent,
    canActivate: [SuperAdminGuard],
    data: { title: 'Super Admin', breadcrumb: 'Super Admin' },
  },
];
