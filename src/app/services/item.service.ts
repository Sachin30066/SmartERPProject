import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  rate: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private apiUrl = 'https://smart-erp-api-dpfyandtgqa3gpe2.centralus-01.azurewebsites.net/api/Items';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }
}