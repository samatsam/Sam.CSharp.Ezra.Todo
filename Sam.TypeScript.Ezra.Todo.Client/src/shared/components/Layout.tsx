import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogIn, LogOut, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  showSettings?: boolean;
  showBack?: boolean;
  title?: string;
  error?: string | null;
  onAddList?: () => void;
}

export function Layout({ children, showSettings = true, showBack = false, title, error, onAddList }: LayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userEmail, isAnonymous, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-12 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted bg-transparent border border-transparent hover:bg-surface-hover hover:text-text hover:border-border transition-all"
              title={t('auth.back')}
              aria-label={t('auth.back')}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="m-0 text-2xl leading-none font-bold text-text tracking-tight">
            <button
              onClick={() => navigate('/')}
              className="bg-none border-none p-0 font-inherit text-inherit cursor-pointer text-left w-auto focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 focus-visible:rounded"
              aria-label={t('app.title')}
            >
              {title || t('app.title')}
            </button>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {userEmail && <span className="text-sm text-text-muted font-medium">{userEmail}</span>}
          {isAnonymous && (
            <span className="inline-flex items-center h-6 px-2 bg-surface-alt text-text-muted border border-border rounded-md text-[11px] font-semibold uppercase tracking-wider">
              {t('auth.anonymous')}
            </span>
          )}
          {onAddList && (
            <button
              onClick={onAddList}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted bg-transparent border border-transparent hover:bg-surface-hover hover:text-text hover:border-border transition-all"
              title={t('app.addList')}
              aria-label={t('app.addList')}
            >
              <Plus size={20} />
            </button>
          )}
          {showSettings && (
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted bg-transparent border border-transparent hover:bg-surface-hover hover:text-text hover:border-border transition-all"
              title={t('auth.settings')}
              aria-label={t('auth.settings')}
            >
              <SettingsIcon size={20} />
            </button>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-text-muted bg-transparent border border-transparent hover:bg-surface-hover hover:text-text hover:border-border transition-all"
            title={isAnonymous ? t('auth.login') : t('auth.logout')}
            aria-label={isAnonymous ? t('auth.login') : t('auth.logout')}
          >
            {isAnonymous ? <LogIn size={20} /> : <LogOut size={20} />}
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-error-bg text-error p-3 rounded-md text-sm font-medium mb-6" role="alert">
          {error}
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}
