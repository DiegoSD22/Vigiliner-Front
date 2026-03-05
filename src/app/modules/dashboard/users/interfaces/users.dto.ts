export interface UserDto {
	id: string;
	email: string;
	password: string;
	name: string;
	role: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
}

export interface FindAllUsersResponseDto {
    users: UserDto[];
    total: number;
}

export type UpdateUserDto = Partial<CreateUserDto>;