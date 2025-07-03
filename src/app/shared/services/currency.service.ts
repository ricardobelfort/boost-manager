import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  constructor(private http: HttpClient) {}

  getExchangeRates(base: string = 'USD'): Observable<Record<string, number>> {
    return this.http.get<any>(`/api/rates?base=${base}`).pipe(
      map((data) => data.rates) // .rates retorna só as taxas
    );
  }
}
