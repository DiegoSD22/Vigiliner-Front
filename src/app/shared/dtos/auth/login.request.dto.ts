/**
 * Login Request DTO
 * Define la estructura que envía el cliente al hacer login
 */
export interface LoginRequestDto {
  identifier: string; // email o username
  password: string;
}
