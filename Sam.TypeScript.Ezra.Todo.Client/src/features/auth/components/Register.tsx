import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../core/api/api';
import { AuthForm } from './AuthForm';

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await authApi.register(email, password);
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      } else {
        throw new Error(t('auth.registerFailed'));
      }
    }
  };

  return (
    <AuthForm
      title={t('auth.register')}
      submitLabel={t('auth.submitRegister')}
      onSubmit={handleSubmit}
      footer={
        <>
          {t('auth.hasAccount')}{' '}
          <Link
            to="/login"
            className="font-medium text-primary no-underline transition-colors hover:text-primary-hover hover:underline ml-1"
          >
            {t('auth.loginLink')}
          </Link>
        </>
      }
    />
  );
}
