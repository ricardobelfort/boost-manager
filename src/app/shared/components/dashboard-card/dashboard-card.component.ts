import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-xs p-8 flex justify-between items-start h-full">
      <div>
        <!-- Título -->
        <div class="text-xl text-gray-500 font-normal mb-2">{{ title }}</div>
        <!-- Valor -->
        <div class="text-2xl font-bold text-gray-800 mb-3">{{ value }}</div>
        <!-- Subtítulo em duas partes -->
        <div class="flex gap-1 items-baseline">
          <span [ngClass]="subtitleValueColor">{{ subtitleValue }}</span>
          <span [ngClass]="subtitleTextColor">{{ subtitleText }}</span>
        </div>
      </div>
      <div [ngClass]="iconBgClass + ' px-3 py-2 rounded-xl flex items-center'">
        <i [ngClass]="iconClass"></i>
      </div>
    </div>
  `,
})
export class DashboardCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitleValue = '';
  @Input() subtitleText = '';
  @Input() subtitleValueColor = 'text-emerald-500 font-semibold';
  @Input() subtitleTextColor = 'text-gray-400';
  @Input() iconClass = '';
  @Input() iconBgClass = '';
  @Input() valueColor = '';

  get subtitleColorClass() {
    // Se o subtitleValue ou subtitleText tiver porcentagem ou número, use verde, senão cinza
    const subtitle = `${this.subtitleValue} ${this.subtitleText}`;
    if (
      subtitle &&
      (subtitle.includes('new') ||
        subtitle.includes('+') ||
        subtitle.includes('registered') ||
        subtitle.includes('responded'))
    ) {
      return 'text-green-500 font-medium';
    }
    return 'text-gray-400';
  }
}
