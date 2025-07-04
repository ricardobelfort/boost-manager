import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `
    <div class="bg-[#232328] rounded-xl p-6 shadow-md border border-[#222] flex flex-col gap-2">
      <div class="flex items-center justify-between mb-2">
        <span class="text-base font-medium text-gray-200">{{ title }}</span>
        <span class="material-symbols-rounded text-[#7BF2A7] text-2xl">{{ icon }}</span>
      </div>
      <span class="text-3xl font-bold text-[#7BF2A7]">{{ value }}</span>
      <span class="text-xs text-gray-400">{{ subtitle }}</span>
    </div>
  `,
})
export class AppMetricCardComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() value: any = '';
  @Input() subtitle: string = '';
  @Input() valueClass: string = '';
}
