import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '@vigiliner/env/environment';

import {
  CreateOrganizationDto,
  CreateOrganizationResponseDto,
  FindAllOrganizationsResponseDto,
  FindOneOrganizationResponseDto,
  RemoveOrganizationResponseDto,
  UpdateOrganizationDto,
  UpdateOrganizationResponseDto,
} from '../interfaces/organizations.dto';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.API_URL}/api/v1/organizations`;

  create(payload: CreateOrganizationDto) {
    return this.http.post<CreateOrganizationResponseDto>(this.endpoint, payload);
  }

  findAll() {
    return this.http.get<FindAllOrganizationsResponseDto>(this.endpoint);
  }

  findOne(id: string) {
    return this.http.get<FindOneOrganizationResponseDto>(`${this.endpoint}/${id}`);
  }

  update(id: string, payload: UpdateOrganizationDto) {
    return this.http.patch<UpdateOrganizationResponseDto>(`${this.endpoint}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<RemoveOrganizationResponseDto>(`${this.endpoint}/${id}`);
  }
}
