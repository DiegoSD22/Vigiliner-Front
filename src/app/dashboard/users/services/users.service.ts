import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CreateUserDto, FindAllUsersResponseDto, UpdateUserDto } from '../interfaces/users.dto';
import { PaginationDto } from '../../../shared/interfaces/pagination.dto';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.API_URL}/users`;

  create(createUserDto: CreateUserDto) {
    return this.http.post(this.endpoint, createUserDto);
  }

  findAll(paginationDto: PaginationDto) {
    const httpOption = {
      params: { ...paginationDto }
    }

    return this.http.get<FindAllUsersResponseDto>(this.endpoint, httpOption);
  }

  findOne(id: string) {
    return this.http.get(`${this.endpoint}/${id}`);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.http.patch(`${this.endpoint}/${id}`, updateUserDto);
  }

  remove(id: string) {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
  
}
