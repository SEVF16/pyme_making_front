export interface BaseApiResponse {
  success: boolean;
  statusCode: number | null;
  message: string | null;
  timestamp: string;
  path: string;
}

// Para respuestas simples (sin paginación)
export interface ApiResponse<T> extends BaseApiResponse {
  data: T;
}

// Para respuestas paginadas
export interface ApiPaginatedResponse<T> extends BaseApiResponse {
  data: ApiData<T>;
}

// Datos paginados
export interface ApiData<T> {
  result: T[];
  hasNext: boolean;
  offset: number;
  limit: number;
  timestamp: string;
}