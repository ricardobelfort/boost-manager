import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import md5 from 'blueimp-md5';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, OverlayBadgeModule, ButtonModule],
})
export class MenubarComponent {
  items = [
    { label: 'Dashboard', icon: 'pi pi-objects-column', routerLink: '/dashboard' },
    { label: 'Orders', icon: 'pi pi-box', routerLink: '/dashboard/orders' },
    { label: 'Suppliers', icon: 'pi pi-inbox', routerLink: '/dashboard/suppliers' },
    { label: 'Reports', icon: 'pi pi-chart-line', routerLink: '/dashboard/reports' },
    // Administração visível só para admin
    { label: 'Settings', icon: 'pi pi-cog', routerLink: '/admin', adminOnly: true },
  ];
  userName = '';
  userRole = '';
  tenantName = '';
  userAvatarUrl = 'assets/images/avatar-placeholder.png';
  dropdownOpen = false;
  userInitials = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    const profile = await this.auth.getUserProfile();
    this.userName = profile?.name || profile?.email || 'User';
    this.userRole = profile?.role || 'Client';
    this.tenantName = profile?.name || 'Company';
    this.userAvatarUrl = this.getGravatar(profile?.email);

    this.userInitials = this.getInitials(this.userName);

    // Filtra itens para admin
    if (this.userRole !== 'admin') {
      this.items = this.items.filter((i) => !i.adminOnly);
    }
  }

  getGravatar(email?: string) {
    if (!email) return 'assets/images/avatar-placeholder.png';
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=120`;
  }

  // Pega até 2 iniciais
  getInitials(name: string) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
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

  goToProfile() {
    this.router.navigate(['/profile']);
    this.closeDropdown();
  }
  goToSettings() {
    this.router.navigate(['/settings']);
    this.closeDropdown();
  }

  logout() {
    this.auth.signOut().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Logout',
          detail: 'You have successfully logged out of your account.!',
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
