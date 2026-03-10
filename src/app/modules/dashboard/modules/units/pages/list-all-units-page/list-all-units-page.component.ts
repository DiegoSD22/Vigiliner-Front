import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UnitDto } from '../../interfaces/units.dtos';

@Component({
  selector: 'list-all-units-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-all-units-page.component.html',
  styleUrl: './list-all-units-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListAllUnitsPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly initialUnits: UnitDto[] = [
    {
      id: 'UNIT-001',
      name: 'Unidad Norte 01',
      type: 'TRUCK',
      model: 'Sprinter 315',
      brand: 'Mercedes-Benz',
      year: 2023,
      serial_number: 'MB-2301-445',
      license_plate: 'VGI-214',
      status: 'ACTIVE',
      deviceId: 'GPS-001',
      userId: 'USR-17',
      createdById: 'ADM-01',
      createdAt: new Date('2025-08-12T10:00:00'),
      updatedAt: new Date('2026-03-10T08:10:00'),
    },
    {
      id: 'UNIT-002',
      name: 'Unidad Centro 02',
      type: 'VAN',
      model: 'Transit Cargo',
      brand: 'Ford',
      year: 2022,
      serial_number: 'FR-2210-873',
      license_plate: 'VGI-622',
      status: 'IDLE',
      deviceId: 'GPS-002',
      userId: 'USR-08',
      createdById: 'ADM-01',
      createdAt: new Date('2025-05-06T13:40:00'),
      updatedAt: new Date('2026-03-10T07:52:00'),
    },
    {
      id: 'UNIT-003',
      name: 'Unidad Ruta 03',
      type: 'TRUCK',
      model: 'NQR',
      brand: 'Isuzu',
      year: 2021,
      serial_number: 'IZ-2107-901',
      license_plate: 'VGI-903',
      status: 'MAINTENANCE',
      deviceId: 'GPS-003',
      userId: 'USR-21',
      createdById: 'ADM-02',
      createdAt: new Date('2024-11-10T09:15:00'),
      updatedAt: new Date('2026-03-09T18:30:00'),
    },
    {
      id: 'UNIT-004',
      name: 'Unidad Sur 04',
      type: 'CAR',
      model: 'Duster',
      brand: 'Renault',
      year: 2024,
      serial_number: 'RN-2402-118',
      license_plate: 'VGI-448',
      status: 'OFFLINE',
      deviceId: 'GPS-004',
      userId: 'USR-13',
      createdById: 'ADM-03',
      createdAt: new Date('2026-01-20T15:05:00'),
      updatedAt: new Date('2026-03-10T05:15:00'),
    },
    {
      id: 'UNIT-005',
      name: 'Unidad Apoyo 05',
      type: 'VAN',
      model: 'Hiace',
      brand: 'Toyota',
      year: 2020,
      serial_number: 'TY-2004-551',
      license_plate: 'VGI-177',
      status: 'ACTIVE',
      deviceId: 'GPS-005',
      userId: 'USR-05',
      createdById: 'ADM-01',
      createdAt: new Date('2024-09-03T11:20:00'),
      updatedAt: new Date('2026-03-10T08:34:00'),
    },
  ];

  readonly units = signal<UnitDto[]>(this.initialUnits);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE'>('ALL');
  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<'create' | 'edit'>('create');
  readonly selectedUnitId = signal<string | null>(null);
  readonly highlightedUnitId = signal<string | null>(this.initialUnits[0]?.id ?? null);

  readonly filteredUnits = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.units().filter((unit) => {
      const matchesStatus = status === 'ALL' || unit.status === status;
      const matchesTerm =
        term.length === 0 ||
        unit.name.toLowerCase().includes(term) ||
        unit.id.toLowerCase().includes(term) ||
        (unit.license_plate ?? '').toLowerCase().includes(term) ||
        (unit.brand ?? '').toLowerCase().includes(term) ||
        (unit.model ?? '').toLowerCase().includes(term);

      return matchesStatus && matchesTerm;
    });
  });

  readonly totalUnits = computed(() => this.units().length);
  readonly activeUnits = computed(() => this.units().filter((unit) => unit.status === 'ACTIVE').length);
  readonly idleUnits = computed(() => this.units().filter((unit) => unit.status === 'IDLE').length);
  readonly attentionUnits = computed(
    () => this.units().filter((unit) => unit.status === 'OFFLINE' || unit.status === 'MAINTENANCE').length
  );
  readonly selectedUnit = computed(() => {
    const selectedId = this.selectedUnitId();
    return this.units().find((unit) => unit.id === selectedId) ?? null;
  });

  readonly unitForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['TRUCK', [Validators.required]],
    brand: ['', [Validators.required]],
    model: ['', [Validators.required]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2015), Validators.max(2035)]],
    serial_number: ['', [Validators.required]],
    license_plate: ['', [Validators.required]],
    status: ['ACTIVE', [Validators.required]],
    deviceId: [''],
    userId: [''],
  });

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setStatusFilter(value: 'ALL' | 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE'): void {
    this.statusFilter.set(value);
  }

  openCreateDrawer(): void {
    this.drawerMode.set('create');
    this.selectedUnitId.set(null);
    this.unitForm.reset({
      name: '',
      type: 'TRUCK',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      serial_number: '',
      license_plate: '',
      status: 'ACTIVE',
      deviceId: '',
      userId: '',
    });
    this.drawerOpen.set(true);
  }

  openEditDrawer(unit: UnitDto): void {
    this.drawerMode.set('edit');
    this.selectedUnitId.set(unit.id);
    this.unitForm.reset({
      name: unit.name,
      type: unit.type,
      brand: unit.brand ?? '',
      model: unit.model ?? '',
      year: unit.year ?? new Date().getFullYear(),
      serial_number: unit.serial_number ?? '',
      license_plate: unit.license_plate ?? '',
      status: this.normalizeStatus(unit.status),
      deviceId: unit.deviceId ?? '',
      userId: unit.userId ?? '',
    });
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  saveUnit(): void {
    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const formValue = this.unitForm.getRawValue();

    if (this.drawerMode() === 'create') {
      const nextIndex = this.units().length + 1;
      const createdUnit: UnitDto = {
        id: `UNIT-${String(nextIndex).padStart(3, '0')}`,
        name: formValue.name,
        type: formValue.type,
        brand: formValue.brand,
        model: formValue.model,
        year: formValue.year,
        serial_number: formValue.serial_number,
        license_plate: formValue.license_plate,
        status: formValue.status,
        deviceId: formValue.deviceId,
        userId: formValue.userId,
        createdById: 'ADM-MOCK',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.units.update((current) => [createdUnit, ...current]);
      this.highlightedUnitId.set(createdUnit.id);
      this.selectedUnitId.set(createdUnit.id);
    } else {
      const selectedId = this.selectedUnitId();
      if (!selectedId) {
        return;
      }

      this.units.update((current) =>
        current.map((unit) =>
          unit.id === selectedId
            ? {
                ...unit,
                ...formValue,
                updatedAt: new Date(),
              }
            : unit
        )
      );
      this.highlightedUnitId.set(selectedId);
      this.selectedUnitId.set(selectedId);
    }

    this.closeDrawer();
  }

  selectUnit(unitId: string): void {
    this.highlightedUnitId.set(unitId);
    this.selectedUnitId.set(unitId);
  }

  duplicateUnit(unit: UnitDto): void {
    const duplicateIndex = this.units().length + 1;
    const duplicated: UnitDto = {
      ...unit,
      id: `UNIT-${String(duplicateIndex).padStart(3, '0')}`,
      name: `${unit.name} Copia`,
      license_plate: `${unit.license_plate ?? 'VGI'}-COPY`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.units.update((current) => [duplicated, ...current]);
    this.highlightedUnitId.set(duplicated.id);
    this.selectedUnitId.set(duplicated.id);
  }

  deleteUnit(unitId: string): void {
    this.units.update((current) => current.filter((unit) => unit.id !== unitId));
    const fallbackUnitId = this.units()[0]?.id ?? null;

    if (this.highlightedUnitId() === unitId) {
      this.highlightedUnitId.set(fallbackUnitId);
    }

    if (this.selectedUnitId() === unitId) {
      this.selectedUnitId.set(fallbackUnitId);
      this.closeDrawer();
    }
  }

  getStatusLabel(status: string | undefined): string {
    return status === 'ACTIVE'
      ? 'Activa'
      : status === 'IDLE'
        ? 'En espera'
        : status === 'MAINTENANCE'
          ? 'Mantenimiento'
          : 'Offline';
  }

  getStatusBadge(status: string | undefined): string {
    return status === 'ACTIVE'
      ? 'badge-success'
      : status === 'IDLE'
        ? 'badge-warning'
        : status === 'MAINTENANCE'
          ? 'badge-info'
          : 'badge-error';
  }

  private normalizeStatus(status: string | undefined): 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE' {
    if (status === 'ACTIVE' || status === 'IDLE' || status === 'OFFLINE' || status === 'MAINTENANCE') {
      return status;
    }

    return 'ACTIVE';
  }
}
