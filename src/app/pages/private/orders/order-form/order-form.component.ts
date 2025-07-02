import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent, ManualBreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { Order } from '@shared/models/order.model';
import { LoadingService } from '@shared/services/loading.service';
import { OrderService } from '@shared/services/order.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { of, switchMap, take, tap } from 'rxjs';

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

  editingId?: string;
  hoje = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  loadingService = inject(LoadingService);

  boosters = [
    { label: 'Booster 1', value: 'booster 1' },
    { label: 'Booster 2', value: 'booster 2' },
    { label: 'Booster 3', value: 'booster 3' },
  ];
  serviceTypes = [
    { label: 'Camuflagem Dark Meter', value: 'camuflagem dark meter' },
    { label: 'Ranked MP do BO6', value: 'ranked mp do bo6' },
    { label: 'Ranked Warzone', value: 'ranked warzone' },
    { label: 'Bot Lobby', value: 'bot lobby' },
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

  ngOnInit() {
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
    }

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
  }

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
      total_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      booster_value: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
      observation: ['', [Validators.maxLength(500)]],
    },
    {
      validators: this.dateRangeValidator.bind(this),
    }
  );

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
        total_value: formValue.total_value ?? 0,
        booster_value: formValue.booster_value ?? 0,
        observation: formValue.observation ?? '',
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
            detail: 'Pedido cadastrado com sucesso!',
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
                detail: 'Pedido atualizado com sucesso!',
              });
              this.orderForm.reset();
              this.close.emit();
              this.router.navigate(['/dashboard/orders']);
            })
          );
        })
      );
    }

    // Sempre subscribe ao fluxo
    flow$.subscribe();
  }

  onCancel() {
    this.orderForm.reset();
    this.close.emit?.();
    this.router.navigate(['/dashboard/orders']);
  }
}
