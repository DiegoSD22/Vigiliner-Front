// DTOs para Unidades en Vigiliner

export interface UnitDto {
  id: string;
  name: string;
  type: string;
  model?: string;
  brand?: string;
  year?: number;
  serial_number?: string;
  license_plate?: string;
  status?: string;
  lastSeen?: Date;
  deviceId?: string;
  userId?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateUnitRequestDto {
  name: string;
  type: string;
  model?: string;
  brand?: string;
  year?: number;
  serial_number?: string;
  license_plate?: string;
}

export type UpdateUnitRequestDto = Partial<CreateUnitRequestDto>;

export interface GetUnitsQueryDto {
  search?: string;
  limit?: number;
  from?: number;
}

export interface GetUnitsResponseDto {
  total: number;
  units: UnitDto[];
}
