import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { SuperAdminGuard } from '@core/guards/super-admin.guard';
import { TenantGuard } from '@core/guards/tenant.guard';
import { CookiesComponent } from '@pages/public/cookies/cookies.component';
import { LoginComponent } from '@pages/public/login/login.component';
import { PrivacyComponent } from '@pages/public/privacy/privacy.component';
import { RecoveryComponent } from '@pages/public/recovery/recovery.component';
import { SignupComponent } from '@pages/public/signup/signup.component';
import { TermsComponent } from '@pages/public/terms/terms.component';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/recovery', component: RecoveryComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'cookies', component: CookiesComponent },
  {
    path: 'superadmin',
    loadChildren: () => import('./pages/private/superadmin/superadmin.routes').then((r) => r.SUPERADMIN_ROUTES),
    canActivate: [AuthGuard, SuperAdminGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/private/private.routes').then((r) => r.PRIVATE_ROUTES),
    data: {
      breadcrumb: 'Dashboard',
    },
    canActivate: [AuthGuard, TenantGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];
