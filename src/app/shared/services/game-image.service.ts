import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameImageService {
  private apiKey = '3cd1692867ad4c998970c86f7b483427'; // substitua pela sua key do RAWG
  private apiUrl = 'https://api.rawg.io/api/games';

  constructor(private http: HttpClient) {}

  searchGameCover(gameName: string): Observable<string | null> {
    if (!gameName) return of(null);
    const url = `${this.apiUrl}?key=${this.apiKey}&search=${encodeURIComponent(gameName)}&page_size=1`;
    return this.http.get<any>(url).pipe(
      map(resp => resp?.results?.[0]?.background_image ?? null)
    );
  }
}
