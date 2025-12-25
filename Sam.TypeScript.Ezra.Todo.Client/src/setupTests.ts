import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import 'fake-indexeddb/auto';

configure({
  // Prevent html from clogging test outputs
  getElementError: (message) => {
    const error = new Error(message ?? undefined);
    error.name = 'TestingLibraryElementError';
    return error;
  },
});
