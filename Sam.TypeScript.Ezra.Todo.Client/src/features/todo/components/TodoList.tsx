import { useTranslation } from 'react-i18next';
import { type TodoItem as TodoItemType } from '../../../shared/types';
import { TodoItem } from './TodoItem';
import { useDnD } from '../../../shared/hooks/useDnD';

interface TodoListProps {
  todos: TodoItemType[];
  listId: number;
  isActive?: boolean;
  onToggle: (todo: TodoItemType, listId: number) => Promise<void>;
  onDelete: (id: number, listId: number) => Promise<void>;
  onUpdate: (todo: TodoItemType, listId: number) => Promise<void>;
  onReorder: (newTodos: TodoItemType[], listId: number) => Promise<void>;
}

export function TodoList({ todos, listId, isActive = true, onToggle, onDelete, onUpdate, onReorder }: TodoListProps) {
  const { t } = useTranslation();

  // Sort todos by completion status (incomplete first) then by order
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) {
      return a.order - b.order;
    }
    return a.isCompleted ? 1 : -1;
  });

  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    dragOverId,
    handleKeyDown,
    keyboardDraggedId,
  } = useDnD({
    items: sortedTodos,
    onReorder: (newItems) => {
      const updatedTodos = newItems.map((todo, index) => ({
        ...todo,
        order: index + 1,
      }));
      onReorder(updatedTodos, listId);
    },
    getItemId: (t) => t.id,
  });

  if (todos.length === 0) {
    return <p className="p-4 text-center text-text-muted text-sm italic">{t('todo.empty')}</p>;
  }

  return (
    <ul className="list-none p-0 m-0" aria-live="polite" aria-relevant="additions removals">
      {sortedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isActive={isActive}
          onToggle={(t) => onToggle(t, listId)}
          onDelete={(id) => onDelete(id, listId)}
          onUpdate={(t) => onUpdate(t, listId)}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          isKeyboardDragging={keyboardDraggedId === todo.id}
          className={dragOverId === todo.id ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]' : ''}
        />
      ))}
    </ul>
  );
}
