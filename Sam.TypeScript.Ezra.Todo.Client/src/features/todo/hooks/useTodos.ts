import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { todoApi, todoListApi } from '../../../core/api/api';
import type { TodoItem, TodoList } from '../../../shared/types';

export function useTodos() {
  const { t } = useTranslation();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const withErrorHandling = useCallback(
    async (fn: () => Promise<void>, errorKey: string) => {
      try {
        await fn();
        setError(null);
      } catch (err) {
        console.error(err);
        setError(t(errorKey));
      }
    },
    [t],
  );

  const updateListTodos = useCallback((listId: number, updater: (todos: TodoItem[]) => TodoItem[]) => {
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, todos: updater(l.todos) } : l)));
  }, []);

  const loadLists = useCallback(async () => {
    setIsLoading(true);
    await withErrorHandling(async () => {
      const data = await todoListApi.getAll(1, pageSize);
      setLists(data.items);
      setTotalCount(data.totalCount);
      setCurrentPage(1);
    }, 'app.connectionError');
    setIsLoading(false);
  }, [withErrorHandling]);

  const loadMore = useCallback(async () => {
    if (isLoading || lists.length >= totalCount) return;

    setIsLoading(true);
    await withErrorHandling(async () => {
      const nextPage = currentPage + 1;
      const data = await todoListApi.getAll(nextPage, pageSize);
      setLists((prev) => [...prev, ...data.items]);
      setCurrentPage(nextPage);
      setTotalCount(data.totalCount);
    }, 'app.connectionError');
    setIsLoading(false);
  }, [isLoading, lists.length, totalCount, currentPage, withErrorHandling]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (mounted) await loadLists();
    };
    init();
    return () => {
      mounted = false;
    };
  }, [loadLists]);

  const handleCreateList = async (name: string) => {
    let createdList: TodoList | undefined;
    await withErrorHandling(async () => {
      const created = await todoListApi.create(name);
      createdList = { ...created, todos: [] };
      setLists((prev) => [createdList!, ...prev]);
    }, 'app.createFailed');
    return createdList;
  };

  const handleDeleteList = async (id: number) => {
    await withErrorHandling(async () => {
      await todoListApi.delete(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    }, 'app.deleteFailed');
  };

  const handleUpdateList = (id: number, name: string) =>
    withErrorHandling(async () => {
      const updated = await todoListApi.update(id, name);
      setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name: updated.name } : l)));
    }, 'app.toggleFailed');

  const handleReorderLists = async (newListOrder: TodoList[]) => {
    const oldLists = [...lists];
    setLists(newListOrder);
    await withErrorHandling(async () => {
      await todoListApi.reorder(newListOrder);
    }, 'app.reorderFailed');
    if (error) setLists(oldLists);
  };

  const handleCreate = (value: string, listId: number) =>
    withErrorHandling(async () => {
      const created = await todoApi.create(value, listId);
      updateListTodos(listId, (todos) => [...todos, created]);
    }, 'app.createFailed');

  const handleToggle = (todo: TodoItem, listId: number) =>
    withErrorHandling(async () => {
      const updated = await todoApi.toggle(todo);
      updateListTodos(listId, (todos) => todos.map((t) => (t.id === updated.id ? updated : t)));
    }, 'app.toggleFailed');

  const handleUpdate = (todo: TodoItem, listId: number) =>
    withErrorHandling(async () => {
      const updated = await todoApi.update(todo);
      updateListTodos(listId, (todos) => todos.map((t) => (t.id === updated.id ? updated : t)));
    }, 'app.toggleFailed');

  const handleDelete = (id: number, listId: number) =>
    withErrorHandling(async () => {
      await todoApi.delete(id);
      updateListTodos(listId, (todos) => todos.filter((t) => t.id !== id));
    }, 'app.deleteFailed');

  const handleReorder = async (newTodos: TodoItem[], listId: number) => {
    const oldLists = [...lists];
    updateListTodos(listId, () => newTodos);
    await withErrorHandling(async () => {
      await todoApi.reorder(
        listId,
        newTodos.map((t) => t.id),
      );
    }, 'app.reorderFailed');
    if (error) setLists(oldLists);
  };

  return {
    lists,
    error,
    isLoading,
    handleCreateList,
    handleDeleteList,
    handleCreate,
    handleToggle,
    handleDelete,
    handleUpdate,
    handleUpdateList,
    handleReorder,
    handleReorderLists,
    loadMore,
    hasMore: lists.length < totalCount,
    setError,
  };
}
