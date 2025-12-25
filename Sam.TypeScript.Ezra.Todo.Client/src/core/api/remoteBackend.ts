import { API_ROOT, request } from './client';
import type { Backend } from './types';
import type { TodoItem } from '../../shared/types';

const TODOS_URL = `${API_ROOT}/todos`;
const LISTS_URL = `${API_ROOT}/lists`;

export const remoteBackend: Backend = {
  settings: {
    get: async () => request(`${API_ROOT}/settings`),
    update: async (settings) => {
      await request(`${API_ROOT}/settings`, {
        method: 'POST',
        body: JSON.stringify(settings),
      });
    },
  },
  todoList: {
    getAll: async (page = 1, pageSize = 10) => request(`${LISTS_URL}?page=${page}&pageSize=${pageSize}`),
    create: async (name) =>
      request(LISTS_URL, {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    delete: async (id) =>
      request(`${LISTS_URL}/${id}`, {
        method: 'DELETE',
      }),
    update: async (id, name) =>
      request(`${LISTS_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      }),
    reorder: async (newListOrder) => {
      await request(`${LISTS_URL}/reorder`, {
        method: 'POST',
        body: JSON.stringify(newListOrder.map((l) => l.id)),
      });
    },
  },
  todo: {
    reorder: async (listId, orderedIds) =>
      request(`${TODOS_URL}/reorder?listId=${listId}`, {
        method: 'POST',
        body: JSON.stringify(orderedIds),
      }),
    create: async (value, listId) =>
      request(TODOS_URL, {
        method: 'POST',
        body: JSON.stringify({ value, listId }),
      }),
    toggle: async (todo) =>
      request(`${TODOS_URL}/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ value: todo.value, isCompleted: !todo.isCompleted, order: todo.order }),
      }),
    update: async (todo: TodoItem) =>
      request(`${TODOS_URL}/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ value: todo.value, isCompleted: todo.isCompleted, order: todo.order }),
      }),
    delete: async (id) =>
      request(`${TODOS_URL}/${id}`, {
        method: 'DELETE',
      }),
  },
};
