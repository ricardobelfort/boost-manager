// src/app/shared/services/selected-game.service.ts
import { Injectable } from '@angular/core';

export interface SelectedGame {
  id: string;
  name: string;
  image: string;
  desc: string;
}

@Injectable({ providedIn: 'root' })
export class SelectedGameService {
  private _game: SelectedGame | null = null;

  set(game: SelectedGame) {
    this._game = game;
  }

  get(): SelectedGame | null {
    return this._game;
  }

  clear() {
    this._game = null;
  }
}
