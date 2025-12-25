import { localTodoStorage } from './localStorage';
import type { Backend } from './types';

export const localBackend: Backend = {
  settings: {
    get: async () => localTodoStorage.getSettings(),
    update: async (settings) => {
      await localTodoStorage.updateSettings(settings);
    },
  },
  todoList: {
    getAll: async (page = 1, pageSize = 10) => {
      const localLists = await localTodoStorage.getAllLists();
      const items = await Promise.all(
        localLists.map(async (l) => ({
          ...l,
          todos: await localTodoStorage.getAll(l.id),
        })),
      );

      return {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        totalCount: items.length,
      };
    },
    create: async (name) => {
      const created = await localTodoStorage.createList(name);
      return { ...created, todos: [] };
    },
    delete: async (id) => localTodoStorage.deleteList(id),
    update: async (id, name) => {
      const updated = await localTodoStorage.updateList(id, name);
      return { ...updated, todos: await localTodoStorage.getAll(id) };
    },
    reorder: async (newListOrder) => {
      await localTodoStorage.reorderLists(newListOrder.map((l) => l.id));
    },
  },
  todo: {
    reorder: async (listId, orderedIds) => localTodoStorage.reorder(listId, orderedIds),
    create: async (value, listId) => localTodoStorage.create(value, listId),
    toggle: async (todo) =>
      localTodoStorage.update({ ...todo, isCompleted: !todo.isCompleted } as Parameters<
        typeof localTodoStorage.update
      >[0]),
    update: async (todo) => localTodoStorage.update(todo as Parameters<typeof localTodoStorage.update>[0]),
    delete: async (id) => localTodoStorage.delete(id),
  },
};
