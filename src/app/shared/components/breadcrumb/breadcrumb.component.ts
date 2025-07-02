import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface ManualBreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="items?.length" class="flex items-center gap-2 my-6 text-sm text-gray-500">
      <ng-container *ngFor="let item of items; let last = last">
        <ng-container *ngIf="!last">
          <a
            *ngIf="item.route"
            [routerLink]="item.route"
            class="hover:text-lime-600 transition font-medium flex items-center gap-1 cursor-pointer"
          >
            <i *ngIf="item.icon" [class]="item.icon"></i>
            {{ item.label }}
          </a>
          <span *ngIf="!item.route" class="font-medium">{{ item.label }}</span>
          <i class="pi pi-angle-right"></i>
        </ng-container>
        <span *ngIf="last" class="text-lime-600 font-semibold flex items-center gap-1">
          <i *ngIf="item.icon" [class]="item.icon"></i>
          {{ item.label }}
        </span>
      </ng-container>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: ManualBreadcrumbItem[] = [];
}
