import { Routes } from '@angular/router';
import { LoginComponent } from '@pages/public/login/login.component';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/private/private.routes').then((r) => r.PRIVATE_ROUTES),
  },
  { path: '**', component: PageNotFoundComponent },
];
