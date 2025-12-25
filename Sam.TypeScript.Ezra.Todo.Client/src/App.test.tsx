import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { localTodoStorage, resetDB } from './core/api/localStorage';
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import { IDBFactory } from 'fake-indexeddb';

let currentLanguage = 'en';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => {
    const t = (key: string, defaultValue?: string | object) => {
      const translations = currentLanguage === 'es' ? esTranslations : enTranslations;
      const keys = key.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = translations;
      for (const k of keys) {
        value = value?.[k];
      }
      return typeof value === 'string' ? value : typeof defaultValue === 'string' ? defaultValue : key;
    };
    return {
      t,
      i18n: {
        changeLanguage: mockChangeLanguage,
        resolvedLanguage: currentLanguage,
        language: currentLanguage,
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

const mockChangeLanguage = vi.fn().mockImplementation((lng) => {
  currentLanguage = lng;
  return Promise.resolve();
});

describe('App', () => {
  beforeEach(async () => {
    currentLanguage = 'en';

    await resetDB();
    vi.stubGlobal('indexedDB', new IDBFactory());

    localStorage.clear();
    localStorage.setItem('isAnonymous', 'true');

    vi.clearAllMocks();

    mockChangeLanguage.mockImplementation((lng) => {
      currentLanguage = lng;
      return Promise.resolve();
    });

    window.history.pushState({}, '', '/');

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders title', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByLabelText('My Todo Lists')).toBeInTheDocument();
    });
  });

  it('shows empty state instruction message when no lists', async () => {
    render(<App />);
    const title = await screen.findByText('Ready to get organized?');
    expect(title).toBeInTheDocument();
    expect(title.closest('div')).toBeInTheDocument();
  });

  it('can add a new list via header plus button', async () => {
    render(<App />);
    await screen.findByRole('button', { name: /Create Your First List/i });
    fireEvent.click(screen.getByLabelText('Add list'));
    await waitFor(() => {
      expect(screen.getByDisplayValue('New List')).toBeInTheDocument();
    });
  });

  it('loads and displays todos', async () => {
    const list = await localTodoStorage.createList('Work');
    await localTodoStorage.create('Learn React', list.id);
    const todo2 = await localTodoStorage.create('Learn .NET', list.id);
    await localTodoStorage.update({ ...todo2, isCompleted: true });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Learn React')).toBeInTheDocument();
      expect(screen.getByText('Learn .NET')).toBeInTheDocument();
    });
  });

  it('can add a new todo', async () => {
    await localTodoStorage.createList('Work');
    render(<App />);
    const input = await screen.findByPlaceholderText('What needs to be done?');
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(screen.getByLabelText('Add task'));

    await waitFor(() => {
      // Find specifically the button that allows editing, which contains the text
      // "New Task" is now present in the input value (if still editing) or button text (if saved)
      // We look for the button with aria-label starting with "Edit task" AND text content "New Task"
      const buttons = screen.getAllByRole('button', { name: /Edit task/i });
      const newTaskButton = buttons.find((btn) => btn.textContent === 'New Task');
      expect(newTaskButton).toBeInTheDocument();
    });
  });

  it('shows empty state when no todos', async () => {
    await localTodoStorage.createList('Work');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
    });
  });

  it('can toggle a todo', async () => {
    const list = await localTodoStorage.createList('Work');
    await localTodoStorage.create('Task', list.id);
    render(<App />);
    await waitFor(() => expect(screen.getByText('Task')).toBeInTheDocument());
    const checkbox = screen.getByLabelText(/Toggle completion/i);
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it('can delete a todo', async () => {
    const list = await localTodoStorage.createList('Work');
    await localTodoStorage.create('Task', list.id);
    await localTodoStorage.createList('Personal');
    render(<App />);
    await waitFor(() => expect(screen.getByText('Task')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/Delete task "Task"/i));
    await waitFor(() => expect(screen.queryByText('Task')).not.toBeInTheDocument());
  });

  it('moves checked items to the bottom and remembers original position when unchecked', async () => {
    const list = await localTodoStorage.createList('Work');
    await localTodoStorage.create('Task 1', list.id);
    await localTodoStorage.create('Task 2', list.id);
    await localTodoStorage.create('Task 3', list.id);

    render(<App />);
    await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument());

    const getTodoItems = () =>
      screen
        .getAllByRole('listitem')
        .map((li) => {
          const btn = li.querySelector('button[aria-label^="Edit task"]');
          return btn ? btn.textContent : null;
        })
        .filter((text) => text !== null);

    expect(getTodoItems()).toEqual(['Task 1', 'Task 2', 'Task 3']);

    fireEvent.click(screen.getAllByLabelText(/Toggle completion/i)[0]);
    await waitFor(() => expect(getTodoItems()).toEqual(['Task 2', 'Task 3', 'Task 1']));

    fireEvent.click(screen.getAllByLabelText(/Toggle completion/i)[2]);
    await waitFor(() => expect(getTodoItems()).toEqual(['Task 1', 'Task 2', 'Task 3']));
  });

  it('changes language when selected in settings', async () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('Settings'));
    const select = await screen.findByLabelText('Select language');
    fireEvent.change(select, { target: { value: 'es' } });
    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    const { rerender } = render(<App key="es" />);
    currentLanguage = 'es';
    rerender(<App key="es" />);
    await waitFor(() => expect(screen.getByText(/Ajustes/i)).toBeInTheDocument());
  });

  it('can reorder todos and reflects in UI immediately', async () => {
    const list = await localTodoStorage.createList('Work');
    await localTodoStorage.create('Task 1', list.id);
    await localTodoStorage.create('Task 2', list.id);

    render(<App />);
    await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument());

    const getTodoItems = () =>
      screen
        .getAllByRole('listitem')
        .map((li) => {
          const btn = li.querySelector('button[aria-label^="Edit task"]');
          return btn ? btn.textContent : null;
        })
        .filter((text) => text !== null);

    const task1 = screen.getAllByRole('listitem')[0];
    const task2 = screen.getAllByRole('listitem')[1];
    const dataTransfer = { effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(task1, { dataTransfer });
    fireEvent.dragOver(task2, { dataTransfer });
    fireEvent.drop(task2, { dataTransfer });

    await waitFor(() => expect(getTodoItems()).toEqual(['Task 2', 'Task 1']));
  });

  it('can delete the last list', async () => {
    await localTodoStorage.createList('Only List');
    render(<App />);
    await waitFor(() => expect(screen.getByText('Only List')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Delete list'));
    await waitFor(() => {
      expect(screen.queryByText('Only List')).not.toBeInTheDocument();
      expect(screen.getByText('Ready to get organized?')).toBeInTheDocument();
    });
  });

  it('can delete one of multiple lists', async () => {
    await localTodoStorage.createList('List 1');
    await localTodoStorage.createList('List 2');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('List 1')).toBeInTheDocument();
      expect(screen.getByText('List 2')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByLabelText('Delete list')[0]);
    await waitFor(() => {
      expect(screen.queryByText('List 1')).not.toBeInTheDocument();
      expect(screen.getByText('List 2')).toBeInTheDocument();
    });
  });
});
