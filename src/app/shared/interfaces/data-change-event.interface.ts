export interface DataChangeEvent<T = unknown> {
  data: T;
  isValid: boolean;
  
}