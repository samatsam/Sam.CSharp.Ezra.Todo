/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, Trash2 } from 'lucide-react';
import { type TodoItem as TodoItemType } from '../../../shared/types';

interface TodoItemProps {
  todo: TodoItemType;
  isActive?: boolean;
  isKeyboardDragging?: boolean;
  onToggle: (todo: TodoItemType) => void;
  onDelete: (id: number) => void;
  onUpdate: (todo: TodoItemType) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, id: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: number) => void;
  onKeyDown?: (e: React.KeyboardEvent, id: number) => void;
  className?: string;
}

export const TodoItem = memo(function TodoItem({
  todo,
  isActive = true,
  isKeyboardDragging = false,
  onToggle,
  onDelete,
  onUpdate,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onKeyDown,
  className = '',
}: TodoItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== todo.value) {
      onUpdate({ ...todo, value: editValue.trim() });
    } else {
      setEditValue(todo.value);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(todo.value);
    }
  };

  return (
    <li
      className={`group flex items-center p-2 pl-4 pr-3 border-b border-border bg-surface transition-colors min-h-[2.75rem] last:border-b-0 last:rounded-b-lg hover:bg-surface-hover ${todo.isCompleted ? 'opacity-70' : ''} ${className} ${isEditing ? 'bg-surface-alt' : ''}`.trim()}
      draggable={draggable && !isEditing}
      onDragStart={(e) => onDragStart?.(e, todo.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver?.(e, todo.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop?.(e, todo.id)}
      onKeyDown={(e) => onKeyDown?.(e, todo.id)}
      aria-label={`${todo.value}, ${todo.isCompleted ? t('todo.completed') : t('todo.active')}`}
    >
      <label className="flex items-center gap-3 flex-1 cursor-pointer min-h-full pl-0">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onToggle(todo)}
          disabled={isEditing}
          aria-label={`${t('todo.toggle')} ${todo.value}`}
          className="appearance-none w-5 h-5 border-[1.5px] border-border-strong rounded bg-surface cursor-pointer shrink-0 flex items-center justify-center checked:bg-success checked:border-success checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2020%2020%27%20fill=%27white%27%3E%3Cpath%20fill-rule=%27evenodd%27%20d=%27M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2013.586l7.293-7.293a1%201%200%20011.414%200z%27%20clip-rule=%27evenodd%27/%3E%3C/svg%3E')]"
          tabIndex={isActive ? 0 : -1}
        />
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className={`flex-1 text-sm text-text bg-transparent border-b border-border-strong p-0 m-0 outline-none font-inherit ${todo.isCompleted ? 'line-through text-text-muted' : ''}`}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleInputKeyDown}
            aria-label={t('todo.edit')}
            tabIndex={isActive ? 0 : -1}
          />
        ) : (
          <button
            type="button"
            className={`flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap bg-none border-none p-0 font-inherit text-inherit cursor-pointer w-auto focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 focus-visible:rounded ${todo.isCompleted ? 'line-through text-text-muted' : ''}`}
            onClick={() => setIsEditing(true)}
            aria-label={`${t('todo.edit')}: ${todo.value}`}
            tabIndex={isActive ? 0 : -1}
          >
            {todo.value}
          </button>
        )}
      </label>
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`${t('todo.delete')} "${todo.value}"`}
        title={t('todo.delete')}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted bg-transparent border border-transparent hover:bg-surface-hover hover:text-text hover:border-border transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100"
        tabIndex={isActive ? 0 : -1}
      >
        <Trash2 size={18} />
      </button>
      {draggable && (
        <button
          className={`cursor-grab text-text-muted opacity-0 group-hover:opacity-50 transition-opacity p-1 flex items-center justify-center bg-transparent border-none rounded hover:bg-surface-hover focus:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isKeyboardDragging ? 'opacity-100 text-primary bg-surface-alt ring-2 ring-primary' : ''
          }`}
          aria-label={
            isKeyboardDragging
              ? t('todo.dragItemActive', 'Item grabbed. Press arrow keys to move, space to drop, escape to cancel.')
              : t('todo.dragItem', 'Drag item handle')
          }
          aria-pressed={isKeyboardDragging}
          aria-describedby={isKeyboardDragging ? `drag-instructions-${todo.id}` : undefined}
          onKeyDown={(e) => onKeyDown?.(e, todo.id)}
          tabIndex={isActive ? 0 : -1}
        >
          <GripVertical size={16} />
        </button>
      )}
    </li>
  );
});
