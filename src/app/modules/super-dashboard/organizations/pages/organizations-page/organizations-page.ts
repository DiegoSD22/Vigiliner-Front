import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize } from 'rxjs';

import {
  CreateOrganizationDto,
  OrganizationDto,
  OrganizationStatus,
  UpdateOrganizationDto,
} from '../../interfaces/organizations.dto';
import { OrganizationsService } from '../../services/organizations.service';
import { ConfirmDialogComponent } from '@vigiliner/shared/design-system/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-organizations-page',
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly organizationsService = inject(OrganizationsService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isArchiving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly organizations = signal<OrganizationDto[]>([]);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'ALL' | OrganizationStatus>('ALL');

  readonly formOpen = signal(false);
  readonly formMode = signal<'create' | 'edit'>('create');
  readonly selectedOrganizationId = signal<string | null>(null);
  readonly archiveCandidate = signal<OrganizationDto | null>(null);

  readonly organizationForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    status: ['ACTIVE' as OrganizationStatus, [Validators.required]],
  });

  readonly filteredOrganizations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.organizations().filter((organization) => {
      const matchesStatus = status === 'ALL' || organization.status === status;
      const matchesTerm =
        term.length === 0 ||
        organization.name.toLowerCase().includes(term) ||
        organization.id.toLowerCase().includes(term);

      return matchesStatus && matchesTerm;
    });
  });

  constructor() {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.organizationsService
      .findAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.organizations.set(response.data),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'No fue posible cargar las organizaciones.'));
        },
      });
  }

  openCreate(): void {
    this.formMode.set('create');
    this.selectedOrganizationId.set(null);
    this.organizationForm.reset({
      name: '',
      status: 'ACTIVE',
    });
    this.formOpen.set(true);
  }

  openEdit(organization: OrganizationDto): void {
    this.formMode.set('edit');
    this.selectedOrganizationId.set(organization.id);
    this.organizationForm.reset({
      name: organization.name,
      status: organization.status,
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  saveOrganization(): void {
    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.organizationForm.getRawValue();
    const payload = {
      name: formValue.name.trim(),
      status: formValue.status,
    };

    if (this.formMode() === 'create') {
      this.createOrganization(payload);
      return;
    }

    const organizationId = this.selectedOrganizationId();
    if (!organizationId) {
      this.isSubmitting.set(false);
      this.errorMessage.set('No se pudo identificar la organización a editar.');
      return;
    }

    this.updateOrganization(organizationId, payload);
  }

  requestArchive(organization: OrganizationDto): void {
    this.archiveCandidate.set(organization);
  }

  closeArchiveDialog(): void {
    if (this.isArchiving()) {
      return;
    }

    this.archiveCandidate.set(null);
  }

  confirmArchive(): void {
    const organization = this.archiveCandidate();

    if (!organization) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isArchiving.set(true);

    this.organizationsService
      .remove(organization.id)
      .pipe(finalize(() => this.isArchiving.set(false)))
      .subscribe({
        next: () => {
          this.organizations.update((current) => current.filter((item) => item.id !== organization.id));
          this.successMessage.set('Organización archivada exitosamente.');
          this.archiveCandidate.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'No fue posible archivar la organización.'));
        },
      });
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setStatusFilter(value: 'ALL' | OrganizationStatus): void {
    this.statusFilter.set(value);
  }

  trackByOrganizationId(_: number, organization: OrganizationDto): string {
    return organization.id;
  }

  badgeClass(status: OrganizationStatus): string {
    if (status === 'ACTIVE') {
      return 'badge badge-success badge-sm';
    }

    if (status === 'SUSPENDED') {
      return 'badge badge-warning badge-sm';
    }

    return 'badge badge-neutral badge-sm';
  }

  statusLabel(status: OrganizationStatus): string {
    if (status === 'ACTIVE') {
      return 'Activa';
    }

    if (status === 'SUSPENDED') {
      return 'Suspendida';
    }

    return 'Archivada';
  }

  private createOrganization(payload: CreateOrganizationDto): void {
    this.organizationsService
      .create(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.organizations.update((current) => [response.data, ...current]);
          this.successMessage.set('Organización creada exitosamente.');
          this.closeForm();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'No fue posible crear la organización.'));
        },
      });
  }

  private updateOrganization(organizationId: string, payload: UpdateOrganizationDto): void {
    this.organizationsService
      .update(organizationId, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.organizations.update((current) =>
            current.map((item) => (item.id === organizationId ? response.data : item))
          );
          this.successMessage.set('Organización actualizada exitosamente.');
          this.closeForm();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'No fue posible actualizar la organización.'));
        },
      });
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
