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
    { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard' },
    { label: 'Orders', icon: 'pi pi-box', routerLink: '/dashboard/orders' },
    { label: 'Suppliers', icon: 'pi pi-inbox', routerLink: '/dashboard/suppliers' },
    { label: 'Reports', icon: 'pi pi-chart-line', routerLink: '/dashboard/reports' },
    // Administração visível só para admin
    { label: 'Settings', icon: 'pi pi-lock', routerLink: '/admin', adminOnly: true },
  ];
  userName = '';
  userRole = '';
  userAvatarUrl = 'assets/images/avatar-placeholder.png';
  dropdownOpen = false;
  showUpgrade = true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    const profile = await this.auth.getUserProfile();
    this.userName = profile?.full_name || profile?.email || 'Usuário';
    this.userRole = profile?.role || 'Cliente';
    this.userAvatarUrl = this.getGravatar(profile?.email);
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
