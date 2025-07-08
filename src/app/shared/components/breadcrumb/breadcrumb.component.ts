import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface ManualBreadcrumbItem {
  label: string;
  route?: string;
  icon?: string; // Ex: 'pi pi-home'
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="items?.length" class="flex items-center space-x-1 text-[15px] select-none mb-6" aria-label="Breadcrumb">
      <ng-container *ngFor="let item of items; let last = last; let i = index">
        <ng-container *ngIf="i === 0">
          <a
            [routerLink]="item.route || '/dashboard'"
            class="flex items-center gap-1 text-gray-400 hover:text-lime-600 transition font-medium"
          >
            <i class="pi pi-home !text-[17px] -mt-[2px]"></i>
          </a>
          <i class="pi pi-angle-right !text-[16px] !text-gray-300"></i>
        </ng-container>
        <ng-container *ngIf="i > 0 && !last">
          <a
            *ngIf="item.route"
            [routerLink]="item.route"
            class="text-gray-400/90 hover:text-lime-600 transition font-medium"
          >
            {{ item.label }}
          </a>
          <span *ngIf="!item.route" class="text-gray-400/90 font-medium">
            {{ item.label }}
          </span>
          <i class="pi pi-angle-right !text-[16px] !text-gray-300"></i>
        </ng-container>
        <ng-container *ngIf="last && i !== 0">
          <span class="font-semibold text-lime-600">
            {{ item.label }}
          </span>
        </ng-container>
      </ng-container>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: ManualBreadcrumbItem[] = [];
}
