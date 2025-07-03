import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  constructor(private http: HttpClient) {}

  getExchangeRates(base = 'USD') {
    // Exemplo usando open.er-api.com (troque por sua preferida se quiser)
    return this.http.get<any>(`https://open.er-api.com/v6/latest/${base}`).pipe(
      map((resp) => resp.rates)
    );
  }
}
