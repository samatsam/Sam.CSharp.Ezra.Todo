import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi, settingsApi } from '../../../core/api/api';
import { useTheme } from '../../theme/hooks/useTheme';

export function useAuth() {
  const { i18n } = useTranslation();
  const { setTheme } = useTheme();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(authApi.isAnonymous());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const info = await authApi.getUserInfo();
        if (info) {
          setUserEmail(info.email);
          setIsAnonymous(false);
          // Also fetch and apply settings
          const settings = await settingsApi.get();
          if (settings.theme) setTheme(settings.theme);
          if (settings.language) i18n.changeLanguage(settings.language === 'ENGLISH' ? 'en' : 'es');
        } else {
          setIsAnonymous(true);
        }
      } catch (err) {
        console.error('Failed to fetch user info', err);
        setIsAnonymous(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [setTheme, i18n]);

  const logout = async () => {
    await authApi.logout();
    setIsAnonymous(true);
    setUserEmail(null);
    // After logout, revert to local settings
    const settings = await settingsApi.get();
    if (settings.theme) setTheme(settings.theme);
    if (settings.language) i18n.changeLanguage(settings.language === 'ENGLISH' ? 'en' : 'es');
  };

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    const settings = await settingsApi.get();
    if (settings.theme) setTheme(settings.theme);
    if (settings.language) i18n.changeLanguage(settings.language === 'ENGLISH' ? 'en' : 'es');
    setIsAnonymous(false);
  };

  const loginAnonymous = async () => {
    await authApi.loginAnonymous();
    setIsAnonymous(true);
    // Re-fetch local settings
    const settings = await settingsApi.get();
    if (settings.theme) setTheme(settings.theme);
    if (settings.language) i18n.changeLanguage(settings.language === 'ENGLISH' ? 'en' : 'es');
  };

  return {
    userEmail,
    isAnonymous,
    isLoading,
    logout,
    login,
    loginAnonymous,
  };
}
