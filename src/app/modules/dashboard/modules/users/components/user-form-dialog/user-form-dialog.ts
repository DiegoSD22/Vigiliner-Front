import { Component, inject } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatError, MatFormField, MatLabel } from '@angular/material/select';

import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-form-dialog',
  imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.css'
})
export class UserFormDialog {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly usersService = inject(UsersService);

  public userForm = this.fb.group({
    name:      ['', [ Validators.required ]],
    email:     ['', [ Validators.required, Validators.email ]],
    password:  ['', [ Validators.required, Validators.minLength(6) ]]
  });

  saveUser() {
    console.log('Saving user with data:', this.userForm.value);
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const createUserDto = this.userForm.getRawValue();
    this.usersService.create(createUserDto).subscribe(
      response => {
        console.log('User created successfully', response);
      },
      errorResponse => {
        console.error('Error creating user', errorResponse);
      }
    );

  }

}
