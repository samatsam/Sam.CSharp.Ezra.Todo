import { GripVertical } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type TodoList as TodoListType, type TodoItem as TodoItemType } from '../../../shared/types';
import { AddTodoForm } from './AddTodoForm';
import { ListHeader } from './ListHeader';
import { TodoList } from './TodoList';

interface TodoListContainerProps {
  list: TodoListType;
  isActive: boolean;
  newListId: number | null;
  dragOverListId: number | null;
  keyboardDraggedListId: number | null;
  setActiveListId: (id: number | null) => void;
  handleListDragStart: (e: React.DragEvent, id: number) => void;
  handleListDragEnd: (e: React.DragEvent) => void;
  handleListDragOver: (e: React.DragEvent, id: number) => void;
  handleListDragLeave: (e: React.DragEvent) => void;
  handleListDrop: (e: React.DragEvent, id: number) => void;
  handleListKeyDown: (e: React.KeyboardEvent, id: number) => void;
  handleUpdateList: (id: number, name: string) => Promise<void>;
  handleDeleteList: (id: number) => Promise<void>;
  handleCreate: (value: string, listId: number) => Promise<void>;
  handleToggle: (todo: TodoItemType, listId: number) => Promise<void>;
  handleDelete: (id: number, listId: number) => Promise<void>;
  handleUpdate: (todo: TodoItemType, listId: number) => Promise<void>;
  handleReorder: (newTodos: TodoItemType[], listId: number) => Promise<void>;
}

export function TodoListContainer({
  list,
  isActive,
  newListId,
  dragOverListId,
  keyboardDraggedListId,
  setActiveListId,
  handleListDragStart,
  handleListDragEnd,
  handleListDragOver,
  handleListDragLeave,
  handleListDrop,
  handleListKeyDown,
  handleUpdateList,
  handleDeleteList,
  handleCreate,
  handleToggle,
  handleDelete,
  handleUpdate,
  handleReorder,
}: TodoListContainerProps) {
  const { t } = useTranslation();

  const handleListContainerKeyDown = (e: React.KeyboardEvent, id: number) => {
    handleListKeyDown(e, id); // existing DnD logic
    if (e.target === e.currentTarget) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveListId(id);
      }
    }
    if (e.key === 'Escape') {
      if (isActive) {
        e.preventDefault();
        e.stopPropagation();
        setActiveListId(null);
        (e.currentTarget as HTMLElement).focus();
      }
    }
  };

  const onSectionBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (isActive) setActiveListId(null);
    }
  };

  return (
    <div
      className={`break-inside-avoid mb-6 bg-surface border border-border rounded-lg shadow-sm flex flex-col transition-opacity duration-150 group ${
        dragOverListId === list.id ? 'border-primary ring-1 ring-primary' : ''
      }`}
      draggable
      onDragStart={(e) => handleListDragStart(e, list.id)}
      onDragEnd={handleListDragEnd}
      onDragOver={(e) => handleListDragOver(e, list.id)}
      onDragLeave={handleListDragLeave}
      onDrop={(e) => handleListDrop(e, list.id)}
      onKeyDown={(e) => handleListContainerKeyDown(e, list.id)}
      onBlur={onSectionBlur}
      tabIndex={0}
      // Hack to support tabbing through lists before entering the list
      // TODO: Figure out a semantic way to do this.
      role="button"
      aria-label={`${t('app.list')}: ${list.name}`}
      onFocus={(e) => {
        if (!isActive && e.target !== e.currentTarget) {
          setActiveListId(list.id);
        }
      }}
      onClick={() => {
        if (!isActive) setActiveListId(list.id);
      }}
    >
      <ListHeader
        list={list}
        canDelete={true}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={newListId === list.id}
        onUpdateList={handleUpdateList}
        onDeleteList={handleDeleteList}
        isActive={isActive}
        dragHandle={
          <button
            className={`text-text-muted flex items-center justify-center opacity-50 transition-opacity hover:opacity-100 cursor-grab bg-transparent border-none p-0 w-8 h-8 rounded hover:bg-surface-hover focus:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              keyboardDraggedListId === list.id ? 'opacity-100 text-primary bg-surface-alt ring-2 ring-primary' : ''
            }`}
            aria-label={
              keyboardDraggedListId === list.id
                ? t('app.dragListActive', 'List grabbed. Press arrow keys to move, space to drop, escape to cancel.')
                : t('app.dragList', 'Drag list handle')
            }
            aria-pressed={keyboardDraggedListId === list.id}
            aria-describedby={keyboardDraggedListId === list.id ? `drag-instructions-list-${list.id}` : undefined}
            onKeyDown={(e) => handleListKeyDown?.(e, list.id)}
            tabIndex={isActive ? 0 : -1}
          >
            <GripVertical size={18} />
          </button>
        }
      />
      <AddTodoForm listId={list.id} onCreate={handleCreate} isActive={isActive} />
      <TodoList
        todos={list.todos}
        listId={list.id}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onReorder={handleReorder}
        isActive={isActive}
      />
    </div>
  );
}
