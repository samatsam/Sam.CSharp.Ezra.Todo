import { API_ROOT, getToken, request, setToken } from './client';
import { localBackend } from './localBackend';
import { remoteBackend } from './remoteBackend';
import { Language, Theme, type TodoItem, type TodoList } from '../../shared/types';

let isAnonymousUser: boolean = getToken() ? false : localStorage.getItem('isAnonymous') !== 'false';

// There is no auth for anonymous users so it's always backed by the remote backend
export const authApi = {
  login: async (email: string, password: string): Promise<void> => {
    const data = await request<{ accessToken: string }>(`${API_ROOT}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.accessToken);
    isAnonymousUser = false;
    localStorage.removeItem('isAnonymous');
  },
  register: async (email: string, password: string): Promise<void> => {
    await request(`${API_ROOT}/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  loginAnonymous: async () => {
    setToken(null);
    isAnonymousUser = true;
    localStorage.setItem('isAnonymous', 'true');
  },
  logout: async () => {
    setToken(null);
    await authApi.loginAnonymous();
  },
  isAnonymous: () => isAnonymousUser,
  getUserInfo: async (): Promise<{ email: string } | null> => {
    if (isAnonymousUser || !getToken()) return null;
    try {
      return await request(`${API_ROOT}/manage/info`);
    } catch {
      return null;
    }
  },
};

// API client that switches between IndexedDB (local) and REST API (remote) based on auth state
const getBackend = () => (isAnonymousUser ? localBackend : remoteBackend);

export const settingsApi = {
  get: async () => getBackend().settings.get(),
  update: async (settings: { language?: Language; theme?: Theme }) => getBackend().settings.update(settings),
};

export const todoListApi = {
  getAll: async (page: number = 1, pageSize: number = 10) => getBackend().todoList.getAll(page, pageSize),
  create: async (name: string) => getBackend().todoList.create(name),
  delete: async (id: number) => getBackend().todoList.delete(id),
  update: async (id: number, name: string) => getBackend().todoList.update(id, name),
  reorder: async (newListOrder: TodoList[]) => getBackend().todoList.reorder(newListOrder),
};

export const todoApi = {
  reorder: async (listId: number, orderedIds: number[]) => getBackend().todo.reorder(listId, orderedIds),
  create: async (value: string, listId: number) => getBackend().todo.create(value, listId),
  toggle: async (todo: TodoItem) => getBackend().todo.toggle(todo),
  update: async (todo: TodoItem) => getBackend().todo.update(todo),
  delete: async (id: number) => getBackend().todo.delete(id),
};
