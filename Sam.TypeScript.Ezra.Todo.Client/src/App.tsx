import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListPlus, Plus } from 'lucide-react';
import { Login } from './features/auth/components/Login';
import { Register } from './features/auth/components/Register';
import { Settings } from './features/settings/components/Settings';
import { Layout } from './shared/components/Layout';
import { ThemeProvider } from './features/theme/components/ThemeProvider';
import { useActiveListFocus } from './features/todo/hooks/useActiveListFocus';
import { useDnD } from './shared/hooks/useDnD';
import { useIntersectionObserver } from './shared/hooks/useIntersectionObserver';
import { useTodos } from './features/todo/hooks/useTodos';
import { TodoListContainer } from './features/todo/components/TodoListContainer';

export function TodoApp() {
  const { t, i18n } = useTranslation();
  const {
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
    hasMore,
  } = useTodos();

  const {
    handleDragStart: handleListDragStart,
    handleDragEnd: handleListDragEnd,
    handleDragOver: handleListDragOver,
    handleDragLeave: handleListDragLeave,
    handleDrop: handleListDrop,
    handleKeyDown: handleListKeyDown,
    dragOverId: dragOverListId,
    keyboardDraggedId: keyboardDraggedListId,
  } = useDnD({
    items: lists,
    onReorder: handleReorderLists,
    getItemId: (l) => l.id,
  });

  const [newListId, setNewListId] = useState<number | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);

  const onAddList = async () => {
    const created = await handleCreateList(t('app.newList'));
    if (created) {
      setNewListId(created.id);
      setTimeout(() => setNewListId(null), 100);
    }
  };

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || 'en';
  }, [i18n.resolvedLanguage]);

  useActiveListFocus(activeListId);

  const { targetRef: sentinelRef } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !isLoading,
  });

  return (
    <Layout error={error} onAddList={onAddList}>
      {lists.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center gap-4 max-w-[600px] w-full mx-auto my-16 p-8 bg-surface border border-border rounded-lg shadow-sm text-center">
          <ListPlus size={64} className="text-primary opacity-90 mb-2" />
          <h2 className="m-0 text-xl font-bold text-text">{t('app.noListsTitle', 'Ready to get organized?')}</h2>
          <p className="text-sm leading-relaxed m-0 text-text-muted max-w-[400px]">
            {t('app.noListsInstructions')
              .split('+')
              .map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="text-text font-bold px-1.5 py-0.5 bg-surface-alt rounded border border-border font-mono text-[0.9em]">
                      +
                    </span>
                  )}
                </span>
              ))}
          </p>
          <button
            className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-fg border border-transparent rounded-md font-semibold text-sm whitespace-nowrap shadow-sm hover:bg-primary-hover transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-3"
            onClick={onAddList}
          >
            <Plus size={20} />
            {t('app.createNewList', 'Create Your First List')}
          </button>
        </div>
      ) : (
        <>
          <div className="columns-1 md:columns-2 xl:columns-3 gap-6">
            {lists.map((list) => (
              <TodoListContainer
                key={list.id}
                list={list}
                isActive={activeListId === list.id}
                newListId={newListId}
                dragOverListId={dragOverListId}
                keyboardDraggedListId={keyboardDraggedListId}
                setActiveListId={setActiveListId}
                handleListDragStart={handleListDragStart}
                handleListDragEnd={handleListDragEnd}
                handleListDragOver={handleListDragOver}
                handleListDragLeave={handleListDragLeave}
                handleListDrop={handleListDrop}
                handleListKeyDown={handleListKeyDown}
                handleUpdateList={handleUpdateList}
                handleDeleteList={handleDeleteList}
                handleCreate={handleCreate}
                handleToggle={handleToggle}
                handleDelete={handleDelete}
                handleUpdate={handleUpdate}
                handleReorder={handleReorder}
              />
            ))}
          </div>
          <div ref={sentinelRef} className="h-10 w-full mt-8 flex items-center justify-center">
            {isLoading && (
              <div className="text-sm text-text-muted">{t('app.loadingMore', 'Loading more lists...')}</div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

function App() {
  return (
    <Suspense fallback="Loading...">
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<TodoApp />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
