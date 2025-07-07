import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { OnboardingCompletedGuard, OnboardingGuard } from '@core/guards/onboarding.guard';
import { SuperAdminGuard } from '@core/guards/super-admin.guard';
import { TenantGuard } from '@core/guards/tenant.guard';
import { BoosterReportComponent } from '@pages/private/reports/booster-report/booster-report.component';
import { AuthCallbackComponent } from '@pages/public/auth-callback.component';
import { LoginComponent } from '@pages/public/login/login.component';
import { OnboardingComponent } from '@pages/public/onboarding.component';
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
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [OnboardingGuard] },
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
    canActivate: [AuthGuard, TenantGuard, OnboardingCompletedGuard],
  },
  {
    path: 'dashboard/booster-report/:id',
    component: BoosterReportComponent,
  },
  { path: '**', component: PageNotFoundComponent },
];
