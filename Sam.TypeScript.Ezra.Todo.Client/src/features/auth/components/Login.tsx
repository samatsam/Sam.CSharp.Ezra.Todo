import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from './AuthForm';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loginAnonymous } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      throw new Error(t('auth.loginFailed'));
    }
  };

  const handleAnonymous = async () => {
    await loginAnonymous();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center">
      <AuthForm
        title={t('auth.login')}
        submitLabel={t('auth.submitLogin')}
        onSubmit={handleSubmit}
        footer={
          <>
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="font-medium text-primary no-underline transition-colors hover:text-primary-hover hover:underline ml-1"
            >
              {t('auth.registerLink')}
            </Link>
          </>
        }
      />

      <div className="flex items-center w-full max-w-[400px] my-4">
        <div className="flex-1 h-px bg-border"></div>
        <span className="mx-3 text-xs text-text-muted uppercase tracking-wider font-bold">{t('auth.or')}</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-surface text-text border border-border rounded-md font-semibold text-sm transition-all w-full max-w-[400px] whitespace-nowrap shadow-sm hover:bg-surface-hover hover:border-border-strong hover:-translate-y-px active:translate-y-0"
        onClick={handleAnonymous}
      >
        {t('auth.continueAsGuest')}
      </button>
    </div>
  );
}
