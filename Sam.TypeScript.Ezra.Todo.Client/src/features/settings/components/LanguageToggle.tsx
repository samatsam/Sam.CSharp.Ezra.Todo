import { useTranslation } from 'react-i18next';
import { settingsApi } from '../../../core/api/api';
import { Language } from '../../../shared/types';

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const currentLanguageKey = i18n.language as keyof typeof Language;

  const changeLanguage = (language: keyof typeof Language) => {
    const newValue = Language[language];
    i18n.changeLanguage(language).then(() => {
      // Persist language changes to local or remote backend
      settingsApi.update({ language: newValue }).catch((err) => {
        console.error('Failed to persist language setting:', err);
      });
    });
  };

  return (
    <div className="mb-2">
      <select
        id="language-select"
        value={currentLanguageKey}
        onChange={(e) => changeLanguage(e.target.value as keyof typeof Language)}
        aria-label={t('app.selectLanguage')}
        className="w-full p-3 bg-surface border border-border rounded-md text-text text-sm cursor-pointer hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-border focus:border-text-muted"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}
