import { Language, Theme } from '../../shared/types';

const DB_NAME = 'TodoDB';
const TODO_STORE = 'todos';
const LIST_STORE = 'lists';
const SETTINGS_STORE = 'settings';
const DB_VERSION = 3;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    // Migrate the DB
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(LIST_STORE)) {
        db.createObjectStore(LIST_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(TODO_STORE)) {
        const todoStore = db.createObjectStore(TODO_STORE, { keyPath: 'id', autoIncrement: true });
        todoStore.createIndex('listId', 'listId', { unique: false });
      } else {
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const todoStore = transaction.objectStore(TODO_STORE);
        if (!todoStore.indexNames.contains('listId')) {
          todoStore.createIndex('listId', 'listId', { unique: false });
        }
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    };
  });

  return dbPromise;
}

export interface TodoItem {
  id: number;
  value: string;
  isCompleted: boolean;
  order: number;
  listId: number;
}

export interface TodoList {
  id: number;
  name: string;
  order: number;
}

export async function resetDB() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

// Helper to wrap IndexedDB requests in a Promise
function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper to wrap IndexedDB transactions in a Promise
function promisifyTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export const localTodoStorage = {
  getAllLists: async (): Promise<TodoList[]> => {
    const db = await getDB();
    const lists = await promisify(db.transaction(LIST_STORE, 'readonly').objectStore(LIST_STORE).getAll());
    return lists.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  createList: async (name: string): Promise<TodoList> => {
    const db = await getDB();
    const lists = await localTodoStorage.getAllLists();
    const maxOrder = lists.length > 0 ? Math.max(...lists.map((l) => l.order || 0)) : 0;

    const newList = { name, order: maxOrder + 1 };
    const id = await promisify(db.transaction(LIST_STORE, 'readwrite').objectStore(LIST_STORE).add(newList));
    return { ...newList, id: id as number };
  },

  deleteList: async (id: number): Promise<void> => {
    const db = await getDB();
    const todos = await localTodoStorage.getAll(id);
    const transaction = db.transaction([LIST_STORE, TODO_STORE], 'readwrite');

    const todoStore = transaction.objectStore(TODO_STORE);
    todos.forEach((t) => todoStore.delete(t.id));

    const listStore = transaction.objectStore(LIST_STORE);
    listStore.delete(id);

    return promisifyTransaction(transaction);
  },

  updateList: async (id: number, name: string): Promise<TodoList> => {
    const db = await getDB();
    const lists = await localTodoStorage.getAllLists();
    const existing = lists.find((l) => l.id === id);
    const newList = { id, name, order: existing?.order || 0 };
    await promisify(db.transaction(LIST_STORE, 'readwrite').objectStore(LIST_STORE).put(newList));
    return newList;
  },

  reorderLists: async (orderedIds: number[]): Promise<void> => {
    const db = await getDB();
    const lists = await localTodoStorage.getAllLists();
    const transaction = db.transaction(LIST_STORE, 'readwrite');
    const store = transaction.objectStore(LIST_STORE);

    // Update order property for each list based on its position in the array
    orderedIds.forEach((id, index) => {
      const list = lists.find((l) => l.id === id);
      if (list) {
        list.order = index + 1;
        store.put(list);
      }
    });

    return promisifyTransaction(transaction);
  },

  getAll: async (listId: number): Promise<TodoItem[]> => {
    const db = await getDB();
    const todos = await promisify(
      db.transaction(TODO_STORE, 'readonly').objectStore(TODO_STORE).index('listId').getAll(listId),
    );
    return todos.sort((a, b) => a.order - b.order);
  },

  create: async (value: string, listId: number): Promise<TodoItem> => {
    const db = await getDB();
    const todos = await localTodoStorage.getAll(listId);
    const maxOrder = todos.length > 0 ? Math.max(...todos.map((t) => t.order)) : 0;

    const newTodo: Omit<TodoItem, 'id'> = {
      value,
      isCompleted: false,
      order: maxOrder + 1,
      listId,
    };

    const id = await promisify(db.transaction(TODO_STORE, 'readwrite').objectStore(TODO_STORE).add(newTodo));
    return { ...newTodo, id: id as number };
  },

  update: async (todo: TodoItem): Promise<TodoItem> => {
    const db = await getDB();
    await promisify(db.transaction(TODO_STORE, 'readwrite').objectStore(TODO_STORE).put(todo));
    return todo;
  },

  delete: async (id: number): Promise<void> => {
    const db = await getDB();
    await promisify(db.transaction(TODO_STORE, 'readwrite').objectStore(TODO_STORE).delete(id));
  },

  reorder: async (listId: number, orderedIds: number[]): Promise<void> => {
    const db = await getDB();
    const todos = await localTodoStorage.getAll(listId);
    const transaction = db.transaction(TODO_STORE, 'readwrite');
    const store = transaction.objectStore(TODO_STORE);

    orderedIds.forEach((id, index) => {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        todo.order = index + 1;
        store.put(todo);
      }
    });

    return promisifyTransaction(transaction);
  },

  getSettings: async (): Promise<{ language: Language | null; theme: Theme | null }> => {
    const db = await getDB();
    const transaction = db.transaction(SETTINGS_STORE, 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE);

    const [language, theme] = await Promise.all([promisify(store.get('language')), promisify(store.get('theme'))]);

    return {
      language: language as Language | null,
      theme: theme as Theme | null,
    };
  },

  updateSettings: async (settings: { language?: Language; theme?: Theme }): Promise<void> => {
    const db = await getDB();
    const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);

    if (settings.language) store.put(settings.language, 'language');
    if (settings.theme) store.put(settings.theme, 'theme');

    return promisifyTransaction(transaction);
  },
};
