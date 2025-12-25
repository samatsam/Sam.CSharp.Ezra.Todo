import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

interface AddTodoFormProps {
  listId: number;
  isActive?: boolean;
  onCreate: (value: string, listId: number) => Promise<void>;
}

export const AddTodoForm = memo(function AddTodoForm({ listId, isActive = true, onCreate }: AddTodoFormProps) {
  const { t } = useTranslation();
  const [newValue, setNewValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    onCreate(newValue, listId);
    setNewValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 px-4 border-b border-border bg-surface">
      <label htmlFor={`new-todo-input-${listId}`} className="sr-only">
        {t('todo.placeholder')}
      </label>
      <input
        id={`new-todo-input-${listId}`}
        type="text"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        placeholder={t('todo.placeholder')}
        className="flex-1 border-none bg-transparent py-2 text-sm h-auto focus:outline-none focus:ring-0"
        tabIndex={isActive ? 0 : -1}
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text bg-surface border border-border hover:bg-surface-hover hover:border-border-strong transition-all"
        title={t('todo.add')}
        aria-label={t('todo.add')}
        tabIndex={isActive ? 0 : -1}
      >
        <Plus size={20} />
      </button>
    </form>
  );
});
