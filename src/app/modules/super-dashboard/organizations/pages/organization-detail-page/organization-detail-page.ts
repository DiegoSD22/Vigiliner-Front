import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { finalize } from 'rxjs';

import { ConfirmDialogComponent } from '@vigiliner/shared/design-system/confirm-dialog/confirm-dialog.component';

import { OrganizationDto } from '../../interfaces/organizations.dto';
import { CreateOrganizationAdminDto, OrganizationAdminDto, UpdateOrganizationAdminDto } from '../../interfaces/organization-admin.dto';
import { OrganizationsService } from '../../services/organizations.service';
import { OrganizationUsersService } from '../../services/organization-users.service';

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
  private readonly organizationUsersService = inject(OrganizationUsersService);

  readonly isLoadingOrganization = signal(false);
  readonly isLoadingAdmins = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly organization = signal<OrganizationDto | null>(null);
  readonly organizationId = signal(this.route.snapshot.paramMap.get('id') ?? '');

  readonly admins = signal<OrganizationAdminDto[]>([]);
  readonly adminSearchTerm = signal('');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<'create' | 'edit'>('create');
  readonly selectedAdminId = signal<string | null>(null);
  readonly isSavingAdmin = signal(false);
  readonly isRemovingAdmin = signal(false);
  readonly deleteCandidate = signal<OrganizationAdminDto | null>(null);

  readonly filteredAdmins = computed(() => {
    const term = this.adminSearchTerm().trim().toLowerCase();

    return this.admins().filter((admin) => {
      if (!term) {
        return true;
      }

      return (
        admin.name.toLowerCase().includes(term) ||
        admin.email.toLowerCase().includes(term) ||
        admin.username.toLowerCase().includes(term)
      );
    });
  });

  readonly orgAdminCount = computed(
    () => this.admins().filter((admin) => admin.roles.some((role) => role.role.slug === 'org-admin')).length
  );
  readonly customRoleCount = computed(
    () => this.admins().filter((admin) => admin.roles.some((role) => role.role.slug !== 'org-admin')).length
  );

  readonly adminForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    password: ['', [Validators.minLength(8)]],
    roleSlugs: ['org-admin', [Validators.required]],
  });

  constructor() {
    this.loadOrganization();
    this.loadAdmins();
  }

  loadOrganization(): void {
    const id = this.organizationId();

    if (!id) {
      this.errorMessage.set('No se encontró el identificador de la empresa.');
      return;
    }

    this.isLoadingOrganization.set(true);
    this.errorMessage.set(null);

    this.organizationsService
      .findOne(id)
      .pipe(finalize(() => this.isLoadingOrganization.set(false)))
      .subscribe({
        next: (response) => this.organization.set(response.data),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'No fue posible cargar el detalle de la empresa.'));
        },
      });
  }

  loadAdmins(): void {
    const organizationId = this.organizationId();

    if (!organizationId) {
      return;
    }

    this.isLoadingAdmins.set(true);

    this.organizationUsersService
      .findAll(organizationId)
      .pipe(finalize(() => this.isLoadingAdmins.set(false)))
      .subscribe({
        next: (response) => this.admins.set(response.data),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.extractErrorMessage(error, 'No fue posible cargar los administradores de la empresa.')
          );
        },
      });
  }

  setAdminSearchTerm(value: string): void {
    this.adminSearchTerm.set(value);
  }

  openCreateAdmin(): void {
    this.drawerMode.set('create');
    this.selectedAdminId.set(null);
    this.setPasswordValidators(true);
    this.adminForm.reset({
      name: '',
      email: '',
      username: '',
      password: '',
      roleSlugs: 'org-admin',
    });
    this.drawerOpen.set(true);
  }

  openEditAdmin(admin: OrganizationAdminDto): void {
    this.drawerMode.set('edit');
    this.selectedAdminId.set(admin.id);
    this.setPasswordValidators(false);
    this.adminForm.reset({
      name: admin.name,
      email: admin.email,
      username: admin.username,
      password: '',
      roleSlugs: admin.roles.map((role) => role.role.slug).join(', '),
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

    const formValue = this.adminForm.getRawValue();
    const normalizedRoleSlugs = formValue.roleSlugs
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean);

    const createPayload: CreateOrganizationAdminDto = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      username: formValue.username.trim() || undefined,
      password: formValue.password,
      roleSlugs: normalizedRoleSlugs.length > 0 ? normalizedRoleSlugs : ['org-admin'],
    };

    if (this.drawerMode() === 'create') {
      this.createAdmin(createPayload);
      return;
    }

    const adminId = this.selectedAdminId();
    if (!adminId) {
      this.isSavingAdmin.set(false);
      this.errorMessage.set('No se pudo identificar el usuario administrador a editar.');
      return;
    }

    const updatePayload: UpdateOrganizationAdminDto = {
      name: createPayload.name,
      email: createPayload.email,
      username: createPayload.username,
      password: formValue.password.trim() ? createPayload.password : undefined,
      roleSlugs: createPayload.roleSlugs,
    };

    this.updateAdmin(adminId, updatePayload);
  }

  requestDeleteAdmin(admin: OrganizationAdminDto): void {
    this.deleteCandidate.set(admin);
  }

  closeDeleteDialog(): void {
    this.deleteCandidate.set(null);
  }

  confirmDeleteAdmin(): void {
    const candidate = this.deleteCandidate();
    const organizationId = this.organizationId();

    if (!candidate || !organizationId) {
      return;
    }

    this.isRemovingAdmin.set(true);
    this.errorMessage.set(null);

    this.organizationUsersService
      .remove(organizationId, candidate.id)
      .pipe(finalize(() => this.isRemovingAdmin.set(false)))
      .subscribe({
        next: () => {
          this.admins.update((current) => current.filter((admin) => admin.id !== candidate.id));
          this.deleteCandidate.set(null);
          this.successMessage.set('Administrador retirado de la empresa.');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.extractErrorMessage(error, 'No fue posible retirar el administrador de la empresa.')
          );
        },
      });
  }

  adminRoleLabels(admin: OrganizationAdminDto): string[] {
    return admin.roles.map((item) => item.role.slug);
  }

  roleBadgeClass(slug: string): string {
    if (slug === 'org-admin') {
      return 'badge badge-primary badge-sm';
    }

    return 'badge badge-ghost badge-sm';
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

  private setPasswordValidators(required: boolean): void {
    const passwordControl = this.adminForm.controls.password;
    const validators = required ? [Validators.required, Validators.minLength(8)] : [Validators.minLength(8)];
    passwordControl.setValidators(validators);
    passwordControl.updateValueAndValidity();
  }

  private createAdmin(payload: CreateOrganizationAdminDto): void {
    const organizationId = this.organizationId();

    if (!organizationId) {
      this.isSavingAdmin.set(false);
      this.errorMessage.set('No se encontró el contexto de organización para crear el usuario.');
      return;
    }

    this.organizationUsersService
      .create(organizationId, payload)
      .pipe(finalize(() => this.isSavingAdmin.set(false)))
      .subscribe({
        next: (response) => {
          this.admins.update((current) => [response.data, ...current]);
          this.drawerOpen.set(false);
          this.successMessage.set('Administrador asociado exitosamente.');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.extractErrorMessage(error, 'No fue posible asociar el administrador a la empresa.')
          );
        },
      });
  }

  private updateAdmin(adminId: string, payload: UpdateOrganizationAdminDto): void {
    const organizationId = this.organizationId();

    if (!organizationId) {
      this.isSavingAdmin.set(false);
      this.errorMessage.set('No se encontró el contexto de organización para actualizar el usuario.');
      return;
    }

    this.organizationUsersService
      .update(organizationId, adminId, payload)
      .pipe(finalize(() => this.isSavingAdmin.set(false)))
      .subscribe({
        next: (response) => {
          this.admins.update((current) =>
            current.map((admin) => (admin.id === adminId ? response.data : admin))
          );
          this.drawerOpen.set(false);
          this.successMessage.set('Administrador actualizado exitosamente.');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.extractErrorMessage(error, 'No fue posible actualizar el administrador de la empresa.')
          );
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
