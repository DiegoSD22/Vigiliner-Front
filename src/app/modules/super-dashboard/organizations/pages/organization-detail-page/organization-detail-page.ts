import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { finalize } from 'rxjs';

import { ConfirmDialogComponent } from '@vigiliner/shared/design-system/confirm-dialog/confirm-dialog.component';

import { OrganizationDto } from '../../interfaces/organizations.dto';
import { CreateOrganizationAdminDto, OrganizationAdminDto, OrganizationAdminStatus } from '../../interfaces/organization-admin.dto';
import { OrganizationsService } from '../../services/organizations.service';

@Component({
  selector: 'app-organization-detail-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './organization-detail-page.html',
  styleUrl: './organization-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly organizationsService = inject(OrganizationsService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly organization = signal<OrganizationDto | null>(null);
  readonly organizationId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly admins = signal<OrganizationAdminDto[]>(this.buildMockAdmins());
  readonly adminSearchTerm = signal('');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<'create' | 'edit'>('create');
  readonly selectedAdminId = signal<string | null>(null);
  readonly isSavingAdmin = signal(false);
  readonly deleteCandidate = signal<OrganizationAdminDto | null>(null);

  readonly filteredAdmins = computed(() => {
    const term = this.adminSearchTerm().trim().toLowerCase();

    return this.admins().filter((admin) => {
      if (!term) {
        return true;
      }

      return admin.name.toLowerCase().includes(term) || admin.email.toLowerCase().includes(term);
    });
  });

  readonly activeAdmins = computed(() => this.admins().filter((admin) => admin.status === 'ACTIVE').length);
  readonly invitedAdmins = computed(() => this.admins().filter((admin) => admin.status === 'INVITED').length);

  readonly adminForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: this.fb.control<'OWNER' | 'ADMIN'>('ADMIN', { validators: [Validators.required] }),
    status: this.fb.control<OrganizationAdminStatus>('INVITED', { validators: [Validators.required] }),
  });

  constructor() {
    this.loadOrganization();
  }

  loadOrganization(): void {
    const id = this.organizationId();

    if (!id) {
      this.errorMessage.set('No se encontró el identificador de la empresa.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.organizationsService
      .findOne(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.organization.set(response.data),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'No fue posible cargar el detalle de la empresa.'));
        },
      });
  }

  setAdminSearchTerm(value: string): void {
    this.adminSearchTerm.set(value);
  }

  openCreateAdmin(): void {
    this.drawerMode.set('create');
    this.selectedAdminId.set(null);
    this.adminForm.reset({
      name: '',
      email: '',
      role: 'ADMIN',
      status: 'INVITED',
    });
    this.drawerOpen.set(true);
  }

  openEditAdmin(admin: OrganizationAdminDto): void {
    this.drawerMode.set('edit');
    this.selectedAdminId.set(admin.id);
    this.adminForm.reset({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
    });
    this.drawerOpen.set(true);
  }

  closeAdminDrawer(): void {
    this.drawerOpen.set(false);
  }

  saveAdmin(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.isSavingAdmin.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload: CreateOrganizationAdminDto = {
      ...this.adminForm.getRawValue(),
      name: this.adminForm.getRawValue().name.trim(),
      email: this.adminForm.getRawValue().email.trim().toLowerCase(),
    };

    if (this.drawerMode() === 'create') {
      const createdAdmin: OrganizationAdminDto = {
        id: `ORG-ADMIN-${Date.now()}`,
        ...payload,
        lastAccessAt: null,
      };

      this.admins.update((current) => [createdAdmin, ...current]);
      this.finishAdminSave('Administrador asociado exitosamente.');
      return;
    }

    const adminId = this.selectedAdminId();
    if (!adminId) {
      this.isSavingAdmin.set(false);
      this.errorMessage.set('No se pudo identificar el usuario administrador a editar.');
      return;
    }

    this.admins.update((current) =>
      current.map((admin) =>
        admin.id === adminId
          ? {
              ...admin,
              ...payload,
            }
          : admin
      )
    );

    this.finishAdminSave('Administrador actualizado exitosamente.');
  }

  requestDeleteAdmin(admin: OrganizationAdminDto): void {
    this.deleteCandidate.set(admin);
  }

  closeDeleteDialog(): void {
    this.deleteCandidate.set(null);
  }

  confirmDeleteAdmin(): void {
    const candidate = this.deleteCandidate();

    if (!candidate) {
      return;
    }

    this.admins.update((current) => current.filter((admin) => admin.id !== candidate.id));
    this.deleteCandidate.set(null);
    this.successMessage.set('Administrador retirado de la empresa.');
  }

  adminStatusLabel(status: OrganizationAdminStatus): string {
    if (status === 'ACTIVE') {
      return 'Activo';
    }

    if (status === 'INVITED') {
      return 'Invitado';
    }

    return 'Suspendido';
  }

  adminStatusClass(status: OrganizationAdminStatus): string {
    if (status === 'ACTIVE') {
      return 'badge badge-success badge-sm';
    }

    if (status === 'INVITED') {
      return 'badge badge-info badge-sm';
    }

    return 'badge badge-warning badge-sm';
  }

  organizationStatusLabel(status: OrganizationDto['status'] | undefined): string {
    if (status === 'ACTIVE') {
      return 'Activa';
    }

    if (status === 'SUSPENDED') {
      return 'Suspendida';
    }

    return 'Archivada';
  }

  organizationStatusClass(status: OrganizationDto['status'] | undefined): string {
    if (status === 'ACTIVE') {
      return 'badge badge-success';
    }

    if (status === 'SUSPENDED') {
      return 'badge badge-warning';
    }

    return 'badge badge-neutral';
  }

  trackByAdminId(_: number, admin: OrganizationAdminDto): string {
    return admin.id;
  }

  private finishAdminSave(message: string): void {
    this.isSavingAdmin.set(false);
    this.drawerOpen.set(false);
    this.successMessage.set(message);
  }

  private buildMockAdmins(): OrganizationAdminDto[] {
    return [
      {
        id: 'ORG-ADMIN-001',
        name: 'Laura Mendoza',
        email: 'laura.mendoza@empresa.com',
        role: 'OWNER',
        status: 'ACTIVE',
        lastAccessAt: '2026-03-15T14:22:00.000Z',
      },
      {
        id: 'ORG-ADMIN-002',
        name: 'Carlos Pinzón',
        email: 'carlos.pinzon@empresa.com',
        role: 'ADMIN',
        status: 'INVITED',
        lastAccessAt: null,
      },
    ];
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const payload = error.error;

    if (payload && typeof payload === 'object') {
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }

      if (Array.isArray(payload.message)) {
        const firstMessage = payload.message.find((item: unknown) => typeof item === 'string');
        if (typeof firstMessage === 'string' && firstMessage.trim()) {
          return firstMessage;
        }
      }
    }

    return fallback;
  }
}
