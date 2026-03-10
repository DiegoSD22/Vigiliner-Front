import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

import { VigiTableComponent } from '@vigiliner/shared/design-system/vigi-table/vigi-table.component';
import { TableColumn } from '@vigiliner/shared/interfaces/vigi-table.interfaces';

import { UsersService } from '../../services/users.service';
import { UserDto } from '../../interfaces/users.dto';
import { UserFormDialog } from '../../components/user-form-dialog/user-form-dialog';

@Component({
  selector: 'app-list-all-users',
  imports: [CommonModule, MatTableModule, VigiTableComponent],
  templateUrl: './list-all-users.html',
  styleUrl: './list-all-users.css'
})
export class ListAllUsers implements OnInit {

  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);

  users = signal<UserDto[]>([]);
  tableColumns: TableColumn[] = [
    { label: 'Nombre', def: 'name', dataKey: 'name' },
    { label: 'Email', def: 'email', dataKey: 'email' },
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.findAll({ limit: 10, from: 0 }).subscribe(
      response => {
        this.users.set(response.users)
      },
      errorResponse => {
        console.error('Error al cargar los usuarios', errorResponse);
      }
    );
  }

  openUserModal() {
    const dialogRef = this.dialog.open( UserFormDialog, {
      width: '400px',
      data: {}
    });
  }
}
