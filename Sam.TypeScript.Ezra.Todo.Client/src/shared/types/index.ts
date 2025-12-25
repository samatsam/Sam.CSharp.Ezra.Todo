// TODO: Consider obtaining this file by mapping backend classes automatically (OpenAPI? gRPC? etc.)

export interface TodoItem {
  id: number;
  value: string;
  isCompleted: boolean;
  order: number;
}

export interface TodoList {
  id: number;
  name: string;
  todos: TodoItem[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

// Use const rather than enum for erasable syntax
export const Language = {
  en: 'ENGLISH',
  es: 'SPANISH',
} as const;

export type Language = (typeof Language)[keyof typeof Language];

export const Theme = {
  Light: 'LIGHT',
  Dark: 'DARK',
} as const;

export type Theme = (typeof Theme)[keyof typeof Theme];
