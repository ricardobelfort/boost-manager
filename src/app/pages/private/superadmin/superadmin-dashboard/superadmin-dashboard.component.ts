import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppMetricCardComponent } from '@shared/components/metrics/app-metric-card.component';
import { AuditFeedService } from '@shared/services/audit-feed.service';
import { AuthService } from '@shared/services/auth.service';
import { BillingService } from '@shared/services/billing.service';
import { ErrorLogService } from '@shared/services/error-log.service';
import { HealthCheckService } from '@shared/services/health-check.service';
import { OnlineUsersService } from '@shared/services/online-users.service';
import md5 from 'blueimp-md5';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-superadmin-dashboard',
  imports: [CommonModule, RouterModule, ButtonModule, AppMetricCardComponent],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrl: './superadmin-dashboard.component.css',
})
export class SuperadminDashboardComponent implements OnInit {
  private onlineUsersService = inject(OnlineUsersService);
  private auditFeedService = inject(AuditFeedService);
  private errorLogService = inject(ErrorLogService);
  private healthCheckService = inject(HealthCheckService);
  private billingService = inject(BillingService);

  // Rotas exclusivas do superadmin
  items = [
    { label: 'Dashboard', icon: 'dashboard', routerLink: '/superadmin' },
    { label: 'Usuários', icon: 'people', routerLink: '/superadmin/users' },
    { label: 'Tenants', icon: 'business', routerLink: '/superadmin/tenants' },
    { label: 'Roles & Permissões', icon: 'admin_panel_settings', routerLink: '/superadmin/roles' },
    { label: 'Auditoria', icon: 'history', routerLink: '/superadmin/auditoria' },
  ];
  userName = '';
  userRole = '';
  userAvatarUrl = 'assets/images/avatar-placeholder.png';
  dropdownOpen = false;

  onlineUsers$ = this.onlineUsersService.onlineUsers$;
  feed$ = this.auditFeedService.feed$;
  errors$ = this.errorLogService.errors$;
  status$ = this.healthCheckService.status$;
  activePlans$ = this.billingService.activePlans$;
  plans$ = this.billingService.plans$;
  newSignups$: typeof this.auth.newSignups$;
  loginFailures$: typeof this.auth.loginFailures$;
  dbStatus$ = this.healthCheckService.status$;
  totalUsers$: typeof this.auth.totalUsers$;
  totalTenants$ = this.billingService.totalTenants$;
  roles$: typeof this.auth.roles$;
  auditCount$ = this.auditFeedService.auditCount$;

  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.newSignups$ = this.auth.newSignups$;
    this.loginFailures$ = this.auth.loginFailures$;
    this.totalUsers$ = this.auth.totalUsers$;
    this.roles$ = this.auth.roles$;
  }

  async ngOnInit() {
    const profile = await this.auth.getUserProfile();
    this.userName = profile?.full_name || profile?.name || profile?.email || 'Superadmin';
    this.userRole = profile?.role || 'superadmin';
    this.userAvatarUrl = this.getGravatar(profile?.email);
  }

  getGravatar(email?: string) {
    if (!email) return 'assets/images/avatar-placeholder.png';
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=120`;
  }

  isActive(route: string) {
    return this.router.url.startsWith(route);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  closeDropdown() {
    this.dropdownOpen = false;
  }

  logout() {
    this.auth.signOut().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Logout',
          detail: 'Você saiu da sua conta com sucesso!',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao sair',
          detail: err?.message || 'Falha ao encerrar sessão. Tente novamente.',
        });
        this.router.navigate(['/auth/login']);
      },
    });
    this.closeDropdown();
  }
}
