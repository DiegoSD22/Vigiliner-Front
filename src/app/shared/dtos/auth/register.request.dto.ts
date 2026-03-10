/**
 * Register Request DTO
 * Estructura que envía el cliente para crear una nueva cuenta
 */
export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  username?: string;
}
