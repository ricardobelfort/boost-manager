import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@shared/services/loading.service';
import { Order, OrderService } from '@shared/services/order.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-order-form',
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

  loadingService = inject(LoadingService);

  boosters = [
    { label: 'Booster 1', value: 'booster 1' },
    { label: 'Booster 2', value: 'booster 2' },
    { label: 'Booster 3', value: 'booster 3' },
  ];
  serviceTypes = [
    { label: 'Camuflagem Dark Meter - 33 armas', value: 'camuflagem dark meter - 33 armas' },
    { label: 'Ranked MP do BO6', value: 'ranked mp do bo6' },
    { label: 'Ranked Warzone', value: 'ranked warzone' },
    { label: 'Bot Lobby', value: 'bot lobby' },
  ];
  suppliers = [
    { label: 'Fornecedor 1', value: 'fornecedor 1' },
    { label: 'Fornecedor 2', value: 'fornecedor 2' },
    { label: 'Fornecedor 3', value: 'fornecedor 3' },
  ];
  statusList = [
    { label: 'Aguardando', value: 'Aguardando' },
    { label: 'Em andamento', value: 'Em andamento' },
    { label: 'Concluído', value: 'Concluído' },
  ];

  ngOnInit() {
    this.editingId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.editingId) {
      const orderParaEditar = this.orderService.getOrderById(this.editingId);
      if (orderParaEditar) {
        this.orderForm.patchValue({
          ...orderParaEditar,
          startDate: orderParaEditar.startDate ? orderParaEditar.startDate : null,
          endDate: orderParaEditar.endDate ? orderParaEditar.endDate : null,
        });
      }
    }
  }

  orderForm = this.fb.group({
    orderNumber: [''],
    booster: ['', Validators.required],
    serviceType: ['', Validators.required],
    supplier: ['', Validators.required],
    accountEmail: ['', [Validators.required, Validators.email]],
    accountPassword: ['', Validators.required],
    recoveryCode1: ['', Validators.required],
    recoveryCode2: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    status: ['', Validators.required],
    totalValue: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    boosterValue: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
    observation: ['', [Validators.maxLength(500)]],
  });

  dateRangeValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (start && end && end < start) {
      group.get('endDate')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    return null;
  }

  get booster() {
    return this.orderForm.get('booster')!;
  }
  get serviceType() {
    return this.orderForm.get('serviceType')!;
  }
  get supplier() {
    return this.orderForm.get('supplier')!;
  }
  get accountEmail() {
    return this.orderForm.get('accountEmail')!;
  }
  get accountPassword() {
    return this.orderForm.get('accountPassword')!;
  }
  get recoveryCode1() {
    return this.orderForm.get('recoveryCode1')!;
  }
  get recoveryCode2() {
    return this.orderForm.get('recoveryCode2')!;
  }
  get startDate() {
    return this.orderForm.get('startDate')!;
  }
  get endDate() {
    return this.orderForm.get('endDate')!;
  }
  get status() {
    return this.orderForm.get('status')!;
  }
  get totalValue() {
    return this.orderForm.get('totalValue')!;
  }
  get boosterValue() {
    return this.orderForm.get('boosterValue')!;
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
    let orderNumber: string;

    if (!this.editingId) {
      // Gera novo número para pedidos novos
      orderNumber = this.orderService.generateOrderNumber();
    } else {
      // Recupera o número do pedido existente
      const existingOrder = this.orderService.getOrderById(this.editingId);
      orderNumber = existingOrder?.orderNumber ?? this.orderService.generateOrderNumber(); // fallback de segurança!
    }

    const startDateValue =
      formValue.startDate && typeof formValue.startDate !== 'string'
        ? (formValue.startDate as Date).toLocaleString('pt-BR', { hour12: false })
        : formValue.startDate || '';

    const endDateValue =
      formValue.endDate && typeof formValue.endDate !== 'string'
        ? (formValue.endDate as Date).toLocaleString('pt-BR', { hour12: false })
        : formValue.endDate || '';

    const normalizeDate = (d: any) => (d instanceof Date ? d.toISOString() : new Date(d).toISOString());
    const toIsoString = (d: any) => {
      if (!d) return '';
      // Se já for Date, converte; se for string, tenta criar Date e converter
      return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
    };

    const order: Order = {
      id: this.editingId ? this.editingId : this.orderService.generateUUID(),
      orderNumber,
      booster: formValue.booster ?? '',
      serviceType: formValue.serviceType ?? '',
      supplier: formValue.supplier ?? '',
      accountEmail: formValue.accountEmail ?? '',
      accountPassword: formValue.accountPassword ?? '',
      recoveryCode1: formValue.recoveryCode1 ?? '',
      recoveryCode2: formValue.recoveryCode2 ?? '',
      startDate: toIsoString(formValue.startDate),
      endDate: toIsoString(formValue.endDate),
      status: formValue.status ?? '',
      totalValue: formValue.totalValue ?? 0,
      boosterValue: formValue.boosterValue ?? 0,
      observation: formValue.observation ?? '',
    };

    if (this.editingId) {
      this.orderService.updateOrder(order);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Pedido atualizado com sucesso!',
      });
    } else {
      this.orderService.addOrder(order);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Pedido cadastrado com sucesso!',
      });
    }

    this.orderForm.reset();
    this.close.emit();
    this.router.navigate(['/dashboard/orders']);
  }

  onCancel() {
    this.orderForm.reset();
    this.close.emit?.();
    this.router.navigate(['/dashboard/orders']);
  }
}
