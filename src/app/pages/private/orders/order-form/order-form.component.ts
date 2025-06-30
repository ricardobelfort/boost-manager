import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '@shared/services/loading.service';
import { Order, OrderService } from '@shared/services/order.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
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
    { label: 'Serviço 1', value: 'serviço 1' },
    { label: 'Serviço 2', value: 'serviço 2' },
    { label: 'Serviço 3', value: 'serviço 3' },
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
    // Exemplo de como recuperar o id do pedido da rota
    this.editingId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.editingId) {
      // Supondo que você tenha uma função para buscar um pedido pelo id
      const orderParaEditar = this.orderService.getOrderById(this.editingId);
      if (orderParaEditar) {
        this.orderForm.patchValue({
          ...orderParaEditar, // preenche todos os campos do pedido, incluindo orderNumber
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
      startDate: formValue.startDate ?? '',
      endDate: formValue.endDate ?? '',
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
