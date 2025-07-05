import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameImageService } from '@shared/services/game-image.service';
import { SelectedGameService } from '@shared/services/selected-game.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
})
export class GamesComponent implements OnInit {
  private router = inject(Router);
  private gameImageService = inject(GameImageService);
  private selectedGameService = inject(SelectedGameService);

  games = [
    {
      id: 'cod_bo6',
      name: 'Call of Duty: Black Ops 6',
      fallback: 'assets/icons/cod_bo6.png',
      desc: 'Boosting service in the new COD',
      image: '',
      available: true,
      badge: 'New',
      badgeSeverity: 'success',
    },
    {
      id: 'gta_v',
      name: 'GTA V',
      fallback: 'assets/icons/gta_v.png',
      desc: 'Boost for GTA Online accounts',
      image: '',
      available: false,
      badge: 'Unavailable',
      badgeSeverity: 'info',
    },
    {
      id: 'lol',
      name: 'League of Legends',
      fallback: 'assets/icons/lol.png',
      desc: 'Elojob and missions in LoL',
      image: '',
      available: false,
      badge: 'Unavailable',
      badgeSeverity: 'danger',
    },
  ];

  ngOnInit() {
    this.games.forEach((game, idx) => {
      this.gameImageService.searchGameCover(game.name).subscribe((imgUrl) => {
        this.games[idx].image = imgUrl || game.fallback;
      });
    });
  }

  startOrderFor(game: any) {
    this.selectedGameService.set(game);
    this.router.navigate(['/dashboard/orders/new'], {
      queryParams: { game: game.id },
    });
  }
}
