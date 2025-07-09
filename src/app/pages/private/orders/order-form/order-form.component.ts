import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent, ManualBreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { LoadingService } from '@shared/services/loading.service';
import { SelectedGame, SelectedGameService } from '@shared/services/selected-game.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { getSupabaseClient } from 'supabase.client';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    ButtonModule,
    TextareaModule,
    ReactiveFormsModule,
    DividerModule,
    BreadcrumbComponent,
    TabsModule,
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent {
  @Output() close = new EventEmitter<void>();
  private supabase = getSupabaseClient();
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private selectedGameService = inject(SelectedGameService);
  loadingService = inject(LoadingService);

  editingId?: string;
  selectedGame?: SelectedGame;

  // Mesma lista que você já tinha
  rankList = [
    { label: 'Bronze I', value: 'bronze1', image: 'assets/images/bronze-1.webp' },
    { label: 'Bronze II', value: 'bronze2', image: 'assets/images/bronze-1.webp' },
    { label: 'Bronze III', value: 'bronze3', image: 'assets/images/bronze-1.webp' },
    { label: 'Silver I', value: 'silver1', image: 'assets/images/silver-1.webp' },
    { label: 'Silver II', value: 'silver2', image: 'assets/images/silver-1.webp' },
    { label: 'Silver III', value: 'silver3', image: 'assets/images/silver-1.webp' },
    { label: 'Gold I', value: 'gold1', image: 'assets/images/gold-1.webp' },
    { label: 'Gold II', value: 'gold2', image: 'assets/images/gold-1.webp' },
    { label: 'Gold III', value: 'gold3', image: 'assets/images/gold-1.webp' },
    { label: 'Platinum I', value: 'platinum1', image: 'assets/images/platinum-1.webp' },
    { label: 'Platinum II', value: 'platinum2', image: 'assets/images/platinum-1.webp' },
    { label: 'Platinum III', value: 'platinum3', image: 'assets/images/platinum-1.webp' },
    { label: 'Diamond I', value: 'diamond1', image: 'assets/images/diamond-1.webp' },
    { label: 'Diamond II', value: 'diamond2', image: 'assets/images/diamond-1.webp' },
    { label: 'Diamond III', value: 'diamond3', image: 'assets/images/diamond-1.webp' },
    { label: 'Iridescent', value: 'iridescent', image: 'assets/images/iridescent.webp' },
    { label: 'Top 250', value: 'top250', image: 'assets/images/top-250.webp' },
  ];
  chooseGame = [
    { label: 'Warzone', value: 'warzone' },
    { label: 'Modern Warfare 3', value: 'mw3' },
    { label: 'Black Ops 6', value: 'bo6' },
    { label: 'Zombies', value: 'zombies' },
  ];
  choosePlatform = [
    { label: 'PC', value: 'pc' },
    { label: 'Xbox', value: 'xbox' },
    { label: 'PlayStation', value: 'ps' },
    { label: 'Battle Net', value: 'bnet' },
    { label: 'Steam', value: 'steam' },
  ];
  suppliers = [
    { label: 'Supplier 1', value: 'Supplier 1' },
    { label: 'Supplier 2', value: 'Supplier 2' },
    { label: 'Supplier 3', value: 'Supplier 3' },
  ];
  camos = [
    { label: 'Abyss', value: 'abyss' },
    { label: 'Dark Matter', value: 'darkmatter' },
    { label: 'Nebula', value: 'nebula' },
  ];
  platforms = [
    { label: 'PlayStation', value: 'PlayStation' },
    { label: 'Steam', value: 'Steam' },
    { label: 'Battle Net', value: 'Battle Net' },
    { label: 'Xbox', value: 'Xbox' },
  ];
  breadcrumb: ManualBreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Orders', route: '/dashboard/orders' },
    { label: 'New Order' }, // ou 'Editar Pedido'
  ];

  // =========== FORMS ==============
  rankBoostForm = this.fb.group({
    current_rank: ['bronze1', Validators.required],
    current_sr: [0, [Validators.min(0), Validators.max(10000)]],
    game: ['', Validators.required],
    desired_rank: ['top250', Validators.required],
    desired_sr: [10000, [Validators.min(0), Validators.max(10000)]],
    platform: ['', Validators.required],
    total_value: ['', [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    booster_value: ['', [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    supplier_order: [''],
    observation: ['', [Validators.maxLength(500)]],
  });
  botLobbyForm = this.fb.group({
    bot_lobbies: [1, [Validators.required, Validators.min(1)]],
    supplier: ['', Validators.required],
    supplier_order: [''],
    total_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    booster_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    observation: ['', [Validators.maxLength(500)]],
  });
  camoServiceForm = this.fb.group({
    desired_camo: ['', Validators.required],
    game: ['', Validators.required],
    platform: ['', Validators.required],
    total_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    booster_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    supplier_order: [''],
    observation: ['', [Validators.maxLength(500)]],
  });
  powerLevelingForm = this.fb.group({
    current_level: ['', [Validators.required, Validators.min(1)]],
    desired_level: ['', [Validators.required, Validators.min(1)]],
    account_email: ['', [Validators.required, Validators.email]],
    recovery_email: ['', [Validators.required, Validators.email]],
    account_password: ['', Validators.required],
    platform: ['', Validators.required],
    total_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    booster_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    supplier_order: [''],
    observation: ['', [Validators.maxLength(500)]],
  });
  accountPremadeForm = this.fb.group({
    account_email: ['', [Validators.required, Validators.email]],
    recovery_email: ['', [Validators.required, Validators.email]],
    account_password: ['', Validators.required],
    available_camo: [''],
    total_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    booster_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    supplier_order: [''],
    observation: ['', [Validators.maxLength(500)]],
  });
  customRequestForm = this.fb.group({
    observation: ['', [Validators.maxLength(500)]],
    total_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    booster_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
  });

  ngOnInit() {
    this.editingId = this.route.snapshot.paramMap.get('id') || undefined;

    this.route.queryParams.subscribe((params) => {
      const gameId = params['game'];
      if (gameId) {
        const game = this.selectedGameService.get();
        this.selectedGame = game === null ? undefined : game;
      }
    });
  }

  async saveRankBoost() {
    if (this.rankBoostForm.invalid) {
      this.rankBoostForm.markAllAsTouched();
      return;
    }
    const formValue = this.rankBoostForm.value;

    this.loadingService.show();
    try {
      const { error } = await this.supabase.from('orders').insert([
        {
          ...formValue,
          service_type: 'rank_boost',
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (!error) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Rank Boost order saved!' });
        this.rankBoostForm.reset();
        this.router.navigate(['/dashboard/orders']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save order. Try again later.',
        });
      }
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected Error',
        detail: e.message || 'Unexpected error, please try again.',
      });
    } finally {
      this.loadingService.hide();
    }
  }

  async saveBotLobby() {
    if (this.botLobbyForm.invalid) {
      this.botLobbyForm.markAllAsTouched();
      return;
    }
    const formValue = this.botLobbyForm.value;

    this.loadingService.show();
    try {
      const { error } = await this.supabase.from('orders').insert([
        {
          ...formValue,
          service_type: 'bot_lobby',
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (!error) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Bot Lobby order saved!' });
        this.botLobbyForm.reset();
        this.router.navigate(['/dashboard/orders']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save order. Try again later.',
        });
      }
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected Error',
        detail: e.message || 'Unexpected error, please try again.',
      });
    } finally {
      this.loadingService.hide();
    }
  }

  async saveCamoService() {
    if (this.camoServiceForm.invalid) {
      this.camoServiceForm.markAllAsTouched();
      return;
    }
    const formValue = this.camoServiceForm.value;

    this.loadingService.show();
    try {
      const { error } = await this.supabase.from('orders').insert([
        {
          ...formValue,
          service_type: 'bot_lobby',
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (!error) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Bot Lobby order saved!' });
        this.botLobbyForm.reset();
        this.router.navigate(['/dashboard/orders']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save order. Try again later.',
        });
      }
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected Error',
        detail: e.message || 'Unexpected error, please try again.',
      });
    } finally {
      this.loadingService.hide();
    }
  }

  async savePowerLeveling() {
    if (this.powerLevelingForm.invalid) {
      this.powerLevelingForm.markAllAsTouched();
      return;
    }
    const formValue = this.powerLevelingForm.value;

    this.loadingService.show();
    try {
      const { error } = await this.supabase.from('orders').insert([
        {
          ...formValue,
          service_type: 'bot_lobby',
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (!error) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Bot Lobby order saved!' });
        this.botLobbyForm.reset();
        this.router.navigate(['/dashboard/orders']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save order. Try again later.',
        });
      }
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected Error',
        detail: e.message || 'Unexpected error, please try again.',
      });
    } finally {
      this.loadingService.hide();
    }
  }

  async saveAccountPremade() {
    if (this.accountPremadeForm.invalid) {
      this.accountPremadeForm.markAllAsTouched();
      return;
    }
    const formValue = this.accountPremadeForm.value;

    this.loadingService.show();
    try {
      const { error } = await this.supabase.from('orders').insert([
        {
          ...formValue,
          service_type: 'bot_lobby',
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (!error) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Bot Lobby order saved!' });
        this.botLobbyForm.reset();
        this.router.navigate(['/dashboard/orders']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save order. Try again later.',
        });
      }
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected Error',
        detail: e.message || 'Unexpected error, please try again.',
      });
    } finally {
      this.loadingService.hide();
    }
  }

  async saveCustomRequest() {
    if (this.customRequestForm.invalid) {
      this.customRequestForm.markAllAsTouched();
      return;
    }
    const formValue = this.customRequestForm.value;

    this.loadingService.show();
    try {
      const { error } = await this.supabase.from('orders').insert([
        {
          ...formValue,
          service_type: 'bot_lobby',
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (!error) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Bot Lobby order saved!' });
        this.botLobbyForm.reset();
        this.router.navigate(['/dashboard/orders']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to save order. Try again later.',
        });
      }
    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unexpected Error',
        detail: e.message || 'Unexpected error, please try again.',
      });
    } finally {
      this.loadingService.hide();
    }
  }

  // ========== CANCELAR POR TAB ==========
  cancelRankBoost() {
    this.rankBoostForm.reset();
    this.router.navigate(['/dashboard/orders']);
  }
  cancelBotLobby() {
    this.botLobbyForm.reset();
    this.router.navigate(['/dashboard/orders']);
  }
  cancelCamoService() {
    this.camoServiceForm.reset();
    this.router.navigate(['/dashboard/orders']);
  }
  cancelPowerLeveling() {
    this.powerLevelingForm.reset();
    this.router.navigate(['/dashboard/orders']);
  }
  cancelAccountPremade() {
    this.accountPremadeForm.reset();
    this.router.navigate(['/dashboard/orders']);
  }
  cancelCustomRequest() {
    this.customRequestForm.reset();
    this.router.navigate(['/dashboard/orders']);
  }

  // ========== GETTERS DE OPÇÕES ==========
  getRankObj(value: string) {
    return this.rankList.find((r) => r.value === value) || this.rankList[0];
  }
  get currentRankOptions() {
    // Retorna todos menos Top 250
    return this.rankList.filter((rank) => rank.value !== 'top250');
  }
  get desiredRankOptions() {
    // Retorna todos menos Bronze I
    return this.rankList.filter((rank) => rank.value !== 'bronze1');
  }
}
