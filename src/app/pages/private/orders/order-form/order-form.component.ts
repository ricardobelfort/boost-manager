import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent, ManualBreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { Order } from '@shared/models/order.model';
import { LoadingService } from '@shared/services/loading.service';
import { OrderService } from '@shared/services/order.service';
import { SelectedGame, SelectedGameService } from '@shared/services/selected-game.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { of, switchMap, take, tap } from 'rxjs';
import { CurrencyService } from './../../../../shared/services/currency.service';

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
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent {
  @Output() close = new EventEmitter<void>();

  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private currencyService = inject(CurrencyService);
  private selectedGameService = inject(SelectedGameService);
  loadingService = inject(LoadingService);

  editingId?: string;
  convertedValue: number | null = null;
  hoje = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  exchangeRates: Record<string, number> = {};
  ratesLoaded = false;
  boosterConvertedValue: string | null = null;
  selectedGame?: SelectedGame;

  boosters = [
    { label: 'Booster 1', value: 'booster 1' },
    { label: 'Booster 2', value: 'booster 2' },
    { label: 'Booster 3', value: 'booster 3' },
  ];
  serviceTypes = [
    {
      label: 'Ranked Multiplayer',
      value: 'ranked_mp',
      games: ['cod_bo6'],
    },
    {
      label: 'Bot Lobby',
      value: 'bot_lobby',
      games: ['cod_bo6', 'gta_v'],
    },
    {
      label: 'Elojob',
      value: 'elojob',
      games: ['lol'],
    },
    // etc...
  ];

  // gameData: { [key: string]: { name: string; desc: string; image: string } } = {
  //   cod_bo6: { name: 'Call of Duty: Black Ops 6', desc: '...', image: '...' },
  //   gta_v: { name: 'GTA V', desc: '...', image: '...' },
  //   lol: { name: 'League of Legends', desc: '...', image: '...' },
  // };

  games = [
    {
      id: 'cod_bo6',
      name: 'Call of Duty: Black Ops 6',
      fallback: 'assets/icons/cod_bo6.png',
      desc: 'Serviço de boosting no novo COD',
      image: '',
      available: true,
      badge: 'Novo', // ou 'Disponível'
      badgeColor: 'bg-lime-500 text-white',
    },
    {
      id: 'gta_v',
      name: 'GTA V',
      fallback: 'assets/icons/gta_v.png',
      desc: 'Boost para contas GTA Online',
      image: '',
      available: true,
      badge: 'Disponível',
      badgeColor: 'bg-blue-500 text-white',
    },
    {
      id: 'lol',
      name: 'League of Legends',
      fallback: 'assets/icons/lol.png',
      desc: 'Elojob e missões no LoL',
      image: '',
      available: false, // Indica que não há boost disponível no momento
      badge: null,
    },
  ];

  suppliers = [
    { label: 'Supplier 1', value: 'Supplier 1' },
    { label: 'Supplier 2', value: 'Supplier 2' },
    { label: 'Supplier 3', value: 'Supplier 3' },
  ];
  statusList = [
    { label: 'Awaiting', value: 'Awaiting' },
    { label: 'In progress', value: 'In progress' },
    { label: 'Suspected ban', value: 'Suspected ban' },
    { label: 'Finished', value: 'Finished' },
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
  currencies = [
    {
      label: 'US Dollar (USD)',
      value: 'USD',
      icon: 'pi pi-dollar', // PrimeIcons
      image: 'assets/currencies/usd.png', // ou
    },
    {
      label: 'Real (BRL)',
      value: 'BRL',
      icon: 'pi pi-money-bill',
      image: 'assets/currencies/brl.png',
    },
    {
      label: 'Euro (EUR)',
      value: 'EUR',
      icon: 'pi pi-euro',
      image: 'assets/currencies/eur.png',
    },
    {
      label: 'Bitcoin (BTC)',
      value: 'BTC',
      icon: 'pi pi-bitcoin',
      image: 'assets/currencies/btc.png',
    },
  ];

  orderForm = this.fb.nonNullable.group(
    {
      order_number: [''],
      booster: ['', Validators.required],
      service_type: ['', Validators.required],
      weapon_quantity: this.fb.control<number | null>({ value: null, disabled: true }),
      supplier: ['', Validators.required],
      account_email: ['', [Validators.required, Validators.email]],
      account_password: ['', Validators.required],
      recovery_code: [''],
      recovery_email: ['', [Validators.email]],
      platform: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: [''],
      status: ['', Validators.required],
      currency: ['', Validators.required],
      total_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      booster_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      observation: ['', [Validators.maxLength(500)]],
      customer_id: ['', Validators.required],
      customer_order_id: ['', Validators.required],
      lobby_price: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      lobby_quantity: [0, Validators.required],
    },
    {
      validators: this.dateRangeValidator.bind(this),
    }
  );

  ngOnInit() {
    this.fetchRates();
    this.editingId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.editingId) {
      this.orderService
        .getOrderById(this.editingId)
        .pipe(take(1))
        .subscribe((orderParaEditar) => {
          if (orderParaEditar) {
            this.orderForm.patchValue({
              ...orderParaEditar,
              weapon_quantity:
                typeof orderParaEditar.weapon_quantity === 'number' ? orderParaEditar.weapon_quantity : null,
              start_date: orderParaEditar.start_date ? new Date(orderParaEditar.start_date) : undefined,
              end_date: orderParaEditar.end_date ? new Date(orderParaEditar.end_date) : undefined,
            } as Order);
          }
        });

      this.orderForm.get('currency')?.valueChanges.subscribe((base) => {
        this.fetchRates(base);
      });
    }

    this.route.queryParams.subscribe((params) => {
      const gameId = params['game'];
      if (gameId) {
        const game = this.selectedGameService.get();
        this.selectedGame = game === null ? undefined : game;
      }
    });

    this.orderForm.get('service_type')!.valueChanges.subscribe((value) => {
      const isCamuflagem = typeof value === 'string' && (value as string).toLowerCase().includes('camuflagem');
      const weaponCtrl = this.orderForm.get('weapon_quantity');
      if (isCamuflagem) {
        weaponCtrl?.enable();
        weaponCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(33)]);
      } else {
        weaponCtrl?.reset();
        weaponCtrl?.disable();
        weaponCtrl?.clearValidators();
      }
      weaponCtrl?.updateValueAndValidity();
    });

    this.orderForm.get('currency')?.valueChanges.subscribe(() => this.updateConvertedValue());
    this.orderForm.get('total_value')?.valueChanges.subscribe(() => this.updateConvertedValue());
    this.orderForm.get('booster_value')?.valueChanges.subscribe(() => this.updateBoosterConvertedValue());

    this.orderForm.get('service_type')!.valueChanges.subscribe((value) => {
      const isBotLobby = (value ?? '').toLowerCase() === 'bot lobby';
      const customerCtrl = this.orderForm.get('customer_id');
      const customerOrderrCtrl = this.orderForm.get('customer_order_id');
      const lobbyPriceCtrl = this.orderForm.get('lobby_price');
      const lobbyQtyCtrl = this.orderForm.get('lobby_quantity');
      const supplierCtrl = this.orderForm.get('supplier');

      // Sempre: habilita supplier e customer_id (o resto só se for Bot Lobby)
      supplierCtrl?.enable();
      customerCtrl?.enable();
      customerOrderrCtrl?.enable();
      lobbyPriceCtrl?.enable();
      lobbyQtyCtrl?.enable();

      // Set Validators
      if (isBotLobby) {
        // Torna só esses dois required
        supplierCtrl?.setValidators([Validators.required]);
        customerCtrl?.setValidators([Validators.required]);
        customerOrderrCtrl?.setValidators([Validators.required]);
        lobbyPriceCtrl?.setValidators([Validators.required]);
        lobbyQtyCtrl?.setValidators([Validators.required]);

        // Limpa e remove validators dos outros campos
        [
          'booster',
          'account_email',
          'account_password',
          'recovery_code',
          'recovery_email',
          'platform',
          'start_date',
          'end_date',
          'status',
          'currency',
          'total_value',
          'booster_value',
          'weapon_quantity',
          'observation',
        ].forEach((field) => {
          const ctrl = this.orderForm.get(field);
          ctrl?.setValue(''); // Limpa o valor (garante form limpo)
          ctrl?.clearValidators(); // Remove validators
          ctrl?.disable(); // Desabilita campo no form
          ctrl?.updateValueAndValidity({ emitEvent: false });
        });
      } else {
        // Restaura todos os validators e habilita campos
        this.orderForm.get('booster')?.setValidators([Validators.required]);
        this.orderForm.get('account_email')?.setValidators([Validators.required, Validators.email]);
        this.orderForm.get('account_password')?.setValidators([Validators.required]);
        this.orderForm.get('platform')?.setValidators([Validators.required]);
        this.orderForm.get('start_date')?.setValidators([Validators.required]);
        this.orderForm.get('status')?.setValidators([Validators.required]);
        this.orderForm.get('currency')?.setValidators([Validators.required]);
        this.orderForm
          .get('total_value')
          ?.setValidators([Validators.required, Validators.min(0), Validators.max(999999.99)]);
        this.orderForm
          .get('booster_value')
          ?.setValidators([Validators.required, Validators.min(0), Validators.max(999999.99)]);
        this.orderForm.get('service_type')?.setValidators([Validators.required]);
        this.orderForm.get('weapon_quantity')?.clearValidators();
        this.orderForm.get('observation')?.clearValidators();
        customerCtrl?.clearValidators();
        customerOrderrCtrl?.clearValidators();
        lobbyPriceCtrl?.clearValidators();
        lobbyQtyCtrl?.clearValidators();

        [
          'booster',
          'account_email',
          'account_password',
          'recovery_code',
          'recovery_email',
          'platform',
          'start_date',
          'end_date',
          'status',
          'currency',
          'total_value',
          'booster_value',
          'weapon_quantity',
          'observation',
        ].forEach((field) => {
          const ctrl = this.orderForm.get(field);
          ctrl?.enable();
          ctrl?.updateValueAndValidity({ emitEvent: false });
        });

        supplierCtrl?.setValidators([Validators.required]);
        customerCtrl?.setValue('');
        customerCtrl?.disable();
        customerOrderrCtrl?.setValue('');
        customerOrderrCtrl?.disable();
        lobbyPriceCtrl?.setValue(0);
        lobbyPriceCtrl?.disable();
        lobbyQtyCtrl?.setValue(0);
        lobbyQtyCtrl?.disable();
      }

      supplierCtrl?.updateValueAndValidity();
      customerCtrl?.updateValueAndValidity();
      customerOrderrCtrl?.updateValueAndValidity();
      lobbyPriceCtrl?.updateValueAndValidity();
      lobbyQtyCtrl?.updateValueAndValidity();
    });
  }

  getFilteredServiceTypes() {
    return this.serviceTypes || [];
  }

  isBotLobby(): boolean {
    return (this.orderForm.get('service_type')?.value ?? '').toLowerCase() === 'bot lobby';
  }

  onCurrencyChange() {
    this.updateConvertedValue();
  }

  updateBoosterConvertedValue() {
    const boosterValue = this.orderForm.value.booster_value;
    const currency = this.orderForm.value.currency;
    if (!boosterValue || !currency || currency === 'BRL' || !this.exchangeRates[currency]) {
      this.boosterConvertedValue = null;
      return;
    }
    // Converte de BRL para a moeda escolhida
    const rate = this.exchangeRates[currency];
    const converted = boosterValue / rate;
    this.boosterConvertedValue = converted.toLocaleString(this.getLocale(currency), {
      style: 'currency',
      currency,
    });
  }

  getCurrencyLabel(currency: string) {
    return this.currencies.find((c) => c.value === currency)?.label || currency;
  }

  async updateConvertedValue() {
    const value = this.orderForm.value.total_value;
    const currency = this.orderForm.value.currency;
    if (!value || !currency || currency === 'BRL') {
      this.convertedValue = null;
      return;
    }
    // Chama uma função para buscar a cotação atual
    this.convertedValue = await this.convertToBRL(value, currency);
  }

  async convertToBRL(value: number, currency: string): Promise<number> {
    // Exemplo básico com fetch de uma API de câmbio gratuita
    if (currency === 'BRL') return value;
    try {
      const res = await fetch(`https://api.exchangerate.host/convert?from=${currency}&to=BRL&amount=${value}`);
      const data = await res.json();
      return data.result ?? value;
    } catch (e) {
      return value;
    }
  }

  fetchRates(base = 'USD') {
    this.ratesLoaded = false;
    this.currencyService.getExchangeRates(base).subscribe({
      next: (rates) => {
        this.exchangeRates = rates;
        this.ratesLoaded = true;
      },
      error: () => {
        // fallback para evitar crash
        this.exchangeRates = { USD: 1, BRL: 5, EUR: 0.92, BTC: 0.000015 };
        this.ratesLoaded = true;
      },
    });
  }

  getConvertedValues() {
    const fromCurrency = this.orderForm.value.currency || 'USD';
    const amount = +(this.orderForm.value?.total_value ?? 0) || 0;

    // Verifique se rates já carregaram e tem o currency correto
    if (!fromCurrency || !amount || !this.exchangeRates || !this.exchangeRates[fromCurrency]) return [];

    let amountInBase = fromCurrency === 'USD' ? amount : amount / this.exchangeRates[fromCurrency];

    return this.currencies
      .filter((c) => c.value !== fromCurrency)
      .map((curr) => {
        const converted = amountInBase * (this.exchangeRates[curr.value] || 1);
        return {
          label: curr.label,
          value: converted.toLocaleString(this.getLocale(curr.value), { style: 'currency', currency: curr.value }),
        };
      });
  }

  getLocale(currency: string) {
    switch (currency) {
      case 'BRL':
        return 'pt-BR';
      case 'EUR':
        return 'de-DE';
      case 'BTC':
        return 'en-US';
      default:
        return 'en-US';
    }
  }

  dateRangeValidator(control: import('@angular/forms').AbstractControl) {
    if (!(control instanceof FormGroup)) return null;
    const start = control.get('start_date')?.value;
    const end = control.get('end_date')?.value;
    if (start && end && end < start) {
      control.get('end_date')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    return null;
  }

  get booster() {
    return this.orderForm.get('booster')!;
  }
  get service_type() {
    return this.orderForm.get('service_type')!;
  }
  get weapon_quantity() {
    return this.orderForm.get('weapon_quantity')!;
  }
  get supplier() {
    return this.orderForm.get('supplier')!;
  }
  get account_email() {
    return this.orderForm.get('account_email')!;
  }
  get account_password() {
    return this.orderForm.get('account_password')!;
  }
  get recovery_code() {
    return this.orderForm.get('recovery_code')!;
  }
  get recovery_email() {
    return this.orderForm.get('recovery_email')!;
  }
  get platform() {
    return this.orderForm.get('platform')!;
  }
  get start_date() {
    return this.orderForm.get('start_date')!;
  }
  get end_date() {
    return this.orderForm.get('end_date')!;
  }
  get status() {
    return this.orderForm.get('status')!;
  }
  get total_value() {
    return this.orderForm.get('total_value')!;
  }
  get booster_value() {
    return this.orderForm.get('booster_value')!;
  }
  get observation() {
    return this.orderForm.get('observation')!;
  }
  get currency() {
    return this.orderForm.get('currency')!;
  }
  get customer_id() {
    return this.orderForm.get('customer_id')!;
  }

  onSubmit() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      const firstInvalid = Object.keys(this.orderForm.controls).find((key) => this.orderForm.get(key)?.invalid);
      if (firstInvalid) {
        const el = document.querySelector(`[formcontrolname="${firstInvalid}"]`);
        if (el) (el as HTMLElement).focus();
      }
      return;
    }

    const formValue = this.orderForm.value;

    const toIsoString = (d: any) => {
      if (!d) return '';
      return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
    };

    const createOrder = (orderNumber: string) => {
      const order: Order = {
        id: this.editingId ? this.editingId : this.orderService.generateUUID(),
        order_number: orderNumber,
        booster: formValue.booster ?? '',
        service_type: formValue.service_type ?? '',
        weapon_quantity: formValue.weapon_quantity ?? undefined,
        supplier: formValue.supplier ?? '',
        account_email: formValue.account_email ?? '',
        account_password: formValue.account_password ?? '',
        recovery_code: formValue.recovery_code ?? '',
        recovery_email: formValue.recovery_email ?? '',
        platform: formValue.platform ?? '',
        start_date: toIsoString(formValue.start_date),
        end_date: toIsoString(formValue.end_date),
        status: formValue.status ?? '',
        currency: formValue.currency ?? '',
        total_value: formValue.total_value ?? 0,
        booster_value: formValue.booster_value ?? 0,
        observation: formValue.observation ?? '',
        customer_id: formValue.customer_id ?? '',
        customer_order_id: formValue.customer_id ?? '',
        lobby_price: formValue.lobby_price ?? 0,
        lobby_quantity: formValue.lobby_quantity ?? 0,
      };
      return order;
    };

    // Lógica RxJS:
    let flow$: any = of(null);

    if (!this.editingId) {
      // Cadastro novo: já gera número e segue fluxo
      const orderNumber = this.orderService.generateOrderNumber();
      const order = createOrder(orderNumber);
      flow$ = this.orderService.addOrder(order).pipe(
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Request registered successfully!',
          });
          this.orderForm.reset();
          this.close.emit();
          this.router.navigate(['/dashboard/orders']);
        })
      );
    } else {
      // Edição: busca primeiro o pedido, pega o número, depois atualiza
      flow$ = this.orderService.getOrderById(this.editingId).pipe(
        take(1),
        switchMap((existingOrder) => {
          const orderNumber = existingOrder?.order_number ?? this.orderService.generateOrderNumber();
          const order = createOrder(orderNumber);
          return this.orderService.updateOrder(order).pipe(
            tap(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Order updated successfully!',
              });
              this.orderForm.reset();
              this.close.emit();
              this.router.navigate(['/dashboard/orders']);
            })
          );
        })
      );
    }

    this.selectedGameService.clear();

    // Sempre subscribe ao fluxo
    flow$.subscribe();
  }

  onCancel() {
    this.orderForm.reset();
    this.selectedGameService.clear();
    this.close.emit?.();
    this.router.navigate(['/dashboard/orders']);
  }
}
