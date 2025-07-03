import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import md5 from 'blueimp-md5';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-superadmin-dashboard',
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrl: './superadmin-dashboard.component.css',
})
export class SuperadminDashboardComponent implements OnInit {
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

  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

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
