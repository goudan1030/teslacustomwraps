import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, signIn, signOut, isLoading: authLoading } = useAuth();

  const handleAuthClick = async () => {
    try {
      if (isAuthenticated) {
        await signOut();
      } else {
        await signIn();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <header className="border-b border-zinc-800 dark:border-zinc-700 bg-black/80 dark:bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white dark:bg-black text-black dark:text-white rounded flex items-center justify-center">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-wide text-white dark:text-black uppercase">
            {t('header.title')}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="text-xs font-medium tracking-widest text-zinc-500 dark:text-zinc-600 uppercase hover:text-white dark:hover:text-black transition-colors"
            title={language === 'en' ? '切换到中文' : 'Switch to English'}
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            title={theme === 'dark' ? t('main.lightMode') : t('main.darkMode')}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Auth Button */}
          {!authLoading && (
            <button
              onClick={handleAuthClick}
              className="px-4 py-2 text-xs font-medium tracking-wide uppercase rounded border border-zinc-700 dark:border-zinc-300 text-zinc-300 dark:text-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="w-5 h-5 rounded-full" />
              )}
              {isAuthenticated ? t('main.signOut') : t('main.signIn')}
            </button>
          )}

          <div className="text-xs font-medium tracking-widest text-zinc-500 dark:text-zinc-600 uppercase hidden sm:block">
            {t('header.poweredBy').replace('Gemini 2.5', 'DeepSeek AI')}
          </div>
        </div>
      </div>
    </header>
  );
};