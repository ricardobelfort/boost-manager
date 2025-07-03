import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '@shared/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.loading$ | async" class="loading-overlay">
      <svg width="64" height="64" viewBox="0 0 24 24">
        <style>
          .spinner_hzlK {
            animation: spinner_vc4H 0.8s linear infinite;
            animation-delay: -0.8s;
          }
          .spinner_koGT {
            animation-delay: -0.65s;
          }
          .spinner_YF1u {
            animation-delay: -0.5s;
          }
          @keyframes spinner_vc4H {
            0% {
              y: 1px;
              height: 22px;
            }
            93.75% {
              y: 5px;
              height: 14px;
              opacity: 0.2;
            }
          }
        </style>
        <rect class="spinner_hzlK" x="1" y="1" width="6" height="22" fill="#7cce00" />
        <rect class="spinner_hzlK spinner_koGT" x="9" y="1" width="6" height="22" fill="#7cce00" />
        <rect class="spinner_hzlK spinner_YF1u" x="17" y="1" width="6" height="22" fill="#7cce00" />
      </svg>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: background 0.3s;
      }
    `,
  ],
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
