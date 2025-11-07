export interface User {
  id: string;
  auth0_id: string;
  email: string;
  name?: string;
  picture?: string;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR', 
  VIEWER = 'VIEWER',
}

// Common component prop types
export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
}

// GraphQL Context
export interface GraphQLContext {
  req: Request;
  user: object | null;
  dbUser?: User | null;
}

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
