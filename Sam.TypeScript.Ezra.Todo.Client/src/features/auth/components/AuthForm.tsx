import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthFormProps {
  title: string;
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  footer?: React.ReactNode;
}

export function AuthForm({ title, submitLabel, onSubmit, footer }: AuthFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('auth.genericError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mt-[10vh] mx-auto p-8 bg-surface border border-border rounded-lg shadow-lg">
      <h2 className="text-center mb-6 text-xl font-bold text-text tracking-tight">{title}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs font-semibold text-text uppercase tracking-wider">
            {t('auth.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-10 px-3 bg-surface border border-border rounded-md text-text text-sm w-full transition-all focus:outline-none focus:border-text-muted focus:ring-2 focus:ring-border"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs font-semibold text-text uppercase tracking-wider">
            {t('auth.password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-10 px-3 bg-surface border border-border rounded-md text-text text-sm w-full transition-all focus:outline-none focus:border-text-muted focus:ring-2 focus:ring-border"
          />
        </div>
        {error && (
          <div className="bg-error-bg text-error p-3 rounded-md text-sm font-medium mb-4" role="alert">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-fg border border-transparent rounded-md font-semibold text-sm whitespace-nowrap shadow-sm hover:bg-primary-hover transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed w-full"
        >
          {isLoading ? t('app.loading') : submitLabel}
        </button>
      </form>
      {footer && <div className="mt-4 text-center text-sm text-text-muted">{footer}</div>}
    </div>
  );
}
