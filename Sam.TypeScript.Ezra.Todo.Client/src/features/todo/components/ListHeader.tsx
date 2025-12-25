import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { type TodoList as TodoListType } from '../../../shared/types';

interface ListHeaderProps {
  list: TodoListType;
  canDelete: boolean;
  dragHandle: React.ReactNode;
  autoFocus?: boolean;
  isActive?: boolean;
  onUpdateList: (id: number, name: string) => Promise<void>;
  onDeleteList: (id: number) => Promise<void>;
}

export const ListHeader = memo(function ListHeader({
  list,
  canDelete,
  dragHandle,
  autoFocus,
  isActive = true,
  onUpdateList,
  onDeleteList,
}: ListHeaderProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(autoFocus || false);
  const [editValue, setEditValue] = useState(list.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== list.name) {
      onUpdateList(list.id, editValue.trim());
    } else {
      setEditValue(list.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(list.name);
    }
  };

  return (
    <header className="flex justify-between items-center p-3 pl-4 border-b border-border bg-surface-alt rounded-t-lg min-h-[56px]">
      {isEditing ? (
        <input
          ref={inputRef}
          className="flex-1 text-base font-semibold text-text bg-transparent border-b border-border-strong p-0 m-0 mr-3 outline-none min-w-0"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label={t('app.editListTitle')}
          tabIndex={isActive ? 0 : -1}
        />
      ) : (
        <h2 className="flex-1 m-0 text-base font-semibold text-text mr-3 overflow-hidden text-ellipsis whitespace-nowrap flex items-center">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap bg-none border-none p-0 font-inherit text-inherit cursor-pointer w-auto focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded"
            aria-label={`${t('app.editListTitle')}: ${list.name}`}
            tabIndex={isActive ? 0 : -1}
          >
            {list.name}
          </button>
        </h2>
      )}
      <div className="flex items-center gap-1 shrink-0">
        {canDelete && (
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted bg-transparent border border-transparent hover:bg-surface-hover hover:text-text hover:border-border transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100"
            onClick={() => onDeleteList(list.id)}
            aria-label={t('app.deleteList')}
            title={t('app.deleteList')}
            tabIndex={isActive ? 0 : -1}
          >
            <Trash2 size={18} />
          </button>
        )}
        {dragHandle}
      </div>
    </header>
  );
});
