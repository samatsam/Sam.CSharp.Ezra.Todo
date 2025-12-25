import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { Layout } from '../../../shared/components/Layout';
import { Theme } from '../../../shared/types';
import { useTheme } from '../../theme/hooks/useTheme';

export function Settings() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <Layout showSettings={false} showBack={true} title={t('auth.settings')}>
      <div className="bg-surface p-8 border border-border rounded-lg max-w-[600px] mx-auto">
        <div className="flex flex-col gap-1">
          <label htmlFor="language-select" className="text-xs font-semibold text-text uppercase tracking-wider">
            {t('app.language')}
          </label>
          <LanguageToggle />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label className="text-xs font-semibold text-text uppercase tracking-wider">{t('app.theme')}</label>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full p-3 bg-surface border border-border rounded-md text-text font-medium hover:bg-surface-hover hover:border-border-strong transition-colors cursor-pointer"
            aria-label={t('app.theme')}
          >
            {theme === Theme.Light ? (
              <>
                <Moon size={18} />
                <span>{t('app.themeDark')}</span>
              </>
            ) : (
              <>
                <Sun size={18} />
                <span>{t('app.themeLight')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
