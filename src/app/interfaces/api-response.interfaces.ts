// Interfaz genérica base para todas las respuestas paginadas
export interface ApiResponse<T> {
  success: boolean;
  data: ApiData<T>;
  statusCode: number | null;
  message: string | null;
  timestamp: string;
  path: string;
}

export interface ApiData<T> {
  result: T[];
  hasNext: boolean;
  offset: number;
  limit: number;
  timestamp: string;
}
