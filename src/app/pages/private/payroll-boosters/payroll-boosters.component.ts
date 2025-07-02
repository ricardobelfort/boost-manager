import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent, ManualBreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

interface PayrollBooster {
  id: number;
  name: string;
  email: string;
  value: number;
  status: 'Paid' | 'Pending' | 'Late';
  date: string; // ISO format
}

@Component({
  selector: 'app-payroll-boosters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    BreadcrumbComponent,
    InputTextModule,
    InputIcon,
    DividerModule,
    IconField,
  ],
  templateUrl: './payroll-boosters.component.html',
  providers: [ConfirmationService],
})
export class PayrollBoostersComponent {
  payrolls: PayrollBooster[] = [];

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Paid', value: 'Paid' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Late', value: 'Late' },
  ];

  breadcrumb: ManualBreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Payroll Boosters', route: '/dashboard/payroll-boosters' },
  ];

  search = '';
  statusFilter: string | null = null;

  allPayrolls: PayrollBooster[] = []; // todos os dados carregados
  filteredPayrolls: PayrollBooster[] = [];

  ngOnInit() {
    this.loadPayrolls();
  }

  loadPayrolls() {
    this.allPayrolls = [
      { id: 1, name: 'John Doe', email: 'john@example.com', value: 120.0, status: 'Paid', date: '2024-07-01' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', value: 200.5, status: 'Pending', date: '2024-07-02' },
      { id: 3, name: 'Lucas Silva', email: 'lucas@foo.com', value: 80.1, status: 'Late', date: '2024-06-25' },
    ];
    this.applyFilter();
  }

  applyFilter() {
    this.filteredPayrolls = this.allPayrolls.filter((item) => {
      const matchesStatus = this.statusFilter == null || item.status === this.statusFilter;
      const searchLower = this.search.toLowerCase();
      const matchesSearch =
        !this.search ||
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        ('' + item.value).includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }

  onView(row: PayrollBooster) {}
  onEdit(row: PayrollBooster) {}
  onDelete(row: PayrollBooster) {}
}
