import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { LoginComponent } from '@pages/public/login/login.component';
import { RecoveryComponent } from '@pages/public/recovery/recovery.component';
import { SignupComponent } from '@pages/public/signup/signup.component';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/recovery', component: RecoveryComponent },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/private/private.routes').then((r) => r.PRIVATE_ROUTES),
    data: {
      title: 'Dashboard',
    },
    canActivate: [AuthGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];
