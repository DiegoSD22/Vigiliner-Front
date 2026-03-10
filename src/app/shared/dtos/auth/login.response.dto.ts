/**
 * Login Response DTO
 * Define la estructura que retorna el servidor después de un login exitoso
 * Este es el objeto que persisten en el storage
 */

import { IAuthUser, AuthRole } from './auth.types';

export interface LoginResponseDto {
  user: IAuthUser;
  accessToken: string;
  tokenType?: string;
  roles?: AuthRole[];
  permissions?: string[];
  primaryRole?: AuthRole;
}

/**
 * Login Result DTO
 * Respuesta HTTP envuelta en ApiResponse
 */
export interface LoginResultDto extends LoginResponseDto {
  message?: string;
}
