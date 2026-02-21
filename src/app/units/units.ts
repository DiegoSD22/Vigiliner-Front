import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  private apiUrl = 'http://localhost:3000/units';

  private unitsSubject = new BehaviorSubject<any[]>([]);
  units$ = this.unitsSubject.asObservable();

  private selectedUnitSubject = new BehaviorSubject<any | null>(null);
  selectedUnit$ = this.selectedUnitSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadMyUnits() {
    console.log('TOKEN:', localStorage.getItem('access_token'));
    this.http.get<any[]>(`${this.apiUrl}/my-units`)
      .subscribe(units => {
        this.unitsSubject.next(units);
      });
  }

  selectUnit(unit: any) {
    this.selectedUnitSubject.next(unit);
  }

  updateUnitStatus(data: any) {
    console.log('🔄 Actualizando estado de la unidad:', data);
    const current = this.unitsSubject.value;
    console.log('Estado actual de las unidades:', current);
    const updated = current.map(unit => unit.id === data.unitId ? { ...unit, status: data.status, lastSeen: data.lastSeen } : unit);
    console.log('Estado actualizado de las unidades:', updated);
    this.unitsSubject.next(updated);
  }
}