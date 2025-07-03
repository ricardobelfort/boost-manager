import { Routes } from '@angular/router';
import { SuperAdminGuard } from '@core/guards/super-admin.guard';
import { SuperadminDashboardComponent } from './superadmin-dashboard/superadmin-dashboard.component';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    component: SuperadminDashboardComponent,
    canActivate: [SuperAdminGuard],
    data: { title: 'Super Admin', breadcrumb: 'Super Admin' }
  },
  // Adicione outras rotas filhas para outras telas do superadmin se quiser!
];
