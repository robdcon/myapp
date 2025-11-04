export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
