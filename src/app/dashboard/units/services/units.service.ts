import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  UnitDto,
  CreateUnitRequestDto,
  UpdateUnitRequestDto,
  GetUnitsQueryDto,
  GetUnitsResponseDto
} from '../interfaces/units.dtos';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UnitsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.API_URL}/units`;
  private unitsSubject = new BehaviorSubject<any[]>([]);
  units$ = this.unitsSubject.asObservable();

  private selectedUnitSubject = new BehaviorSubject<UnitDto | null>(null);
  selectedUnit$ = this.selectedUnitSubject.asObservable();

  createUnit(data: CreateUnitRequestDto): Observable<UnitDto> {
    return this.http.post<UnitDto>(this.endpoint, data);
  }

  getAllUnits(query: GetUnitsQueryDto): Observable<GetUnitsResponseDto> {
    return this.http.get<GetUnitsResponseDto>(this.endpoint, { params: { ...query } });
  }

  getUnitById(id: string): Observable<UnitDto> {
    return this.http.get<UnitDto>(`${this.endpoint}/${id}`);
  }

  updateUnit(id: string, data: UpdateUnitRequestDto): Observable<UnitDto> {
    return this.http.patch<UnitDto>(`${this.endpoint}/${id}`, data);
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  loadMyUnits() {
    this.http.get<UnitDto[]>(`${this.endpoint}/my-units`)
      .subscribe(units => {
        this.unitsSubject.next(units);
      });
  }

  selectUnit(unit: any) {
    this.selectedUnitSubject.next(unit);
  }

  updateUnitStatus(data: any) {
    const current = this.unitsSubject.value;
    const updated = current.map(unit => unit.id === data.unitId ? { ...unit, status: data.status, lastSeen: data.lastSeen } : unit);
    this.unitsSubject.next(updated);
  }
}
