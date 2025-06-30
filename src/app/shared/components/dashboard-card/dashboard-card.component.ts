import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start h-full">
      <div>
        <h3 class="text-2xl font-semibold text-gray-800 mb-3">{{ title }}</h3>
        <p class="text-4xl font-bold mb-2" [ngClass]="valueColor">{{ value }}</p>
        <p
          class="text-sm text-gray-500"
          [ngClass]="{
            'text-base font-semibold !text-grey-800': subtitle.includes('$'),
          }"
        >
          {{ subtitle }}
        </p>
      </div>
      <i [ngClass]="iconClass"></i>
    </div>
  `,
})
export class DashboardCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() iconClass = '';
  @Input() valueColor = '';
}
