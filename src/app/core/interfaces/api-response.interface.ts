export type ApiMessage = string | string[];

export interface ApiResponse<T> {
  statusCode?: number;
  message?: ApiMessage;
  data: T;
  timestamp?: string;
}

export interface ApiErrorResponse {
  statusCode?: number;
  message?: ApiMessage;
  errors?: Record<string, string[]>;
  timestamp?: string;
}
