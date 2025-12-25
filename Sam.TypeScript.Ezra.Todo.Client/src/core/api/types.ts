import { Language, Theme, type PagedResult, type TodoList, type TodoItem } from '../../shared/types';

export interface SettingsBackend {
  get: () => Promise<{ language: Language | null; theme: Theme | null }>;
  update: (settings: { language?: Language; theme?: Theme }) => Promise<void>;
}

export interface TodoListBackend {
  getAll: (page?: number, pageSize?: number) => Promise<PagedResult<TodoList>>;
  create: (name: string) => Promise<TodoList>;
  delete: (id: number) => Promise<void>;
  update: (id: number, name: string) => Promise<TodoList>;
  reorder: (newListOrder: TodoList[]) => Promise<void>;
}

export interface TodoBackend {
  reorder: (listId: number, orderedIds: number[]) => Promise<void>;
  create: (value: string, listId: number) => Promise<TodoItem>;
  toggle: (todo: TodoItem) => Promise<TodoItem>;
  update: (todo: TodoItem) => Promise<TodoItem>;
  delete: (id: number) => Promise<void>;
}

export interface Backend {
  settings: SettingsBackend;
  todoList: TodoListBackend;
  todo: TodoBackend;
}
