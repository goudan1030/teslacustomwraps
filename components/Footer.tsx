import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const isDark = theme === 'dark';
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t ${isDark ? 'border-zinc-800 bg-black/80' : 'border-zinc-300 bg-white/80'} backdrop-blur-md mt-auto relative z-10`}>
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} rounded flex items-center justify-center`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className={`text-lg font-semibold tracking-wide ${isDark ? 'text-white' : 'text-black'} uppercase`}>
                {t('footer.brand')}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'} leading-relaxed`}>
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold tracking-wider uppercase ${isDark ? 'text-white' : 'text-black'}`}>
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/teslamotors/custom-wraps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}
                >
                  {t('footer.templates')}
                </a>
              </li>
              <li>
                <a 
                  href="https://www.tesla.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}
                >
                  {t('footer.teslaOfficial')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Info */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold tracking-wider uppercase ${isDark ? 'text-white' : 'text-black'}`}>
              {t('footer.about')}
            </h3>
            <ul className="space-y-2">
              <li>
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {t('footer.poweredBy')}
                </span>
              </li>
              <li>
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {t('footer.aiPowered')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-6 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-300'} flex flex-col sm:flex-row justify-between items-center gap-4`}>
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'} tracking-wide`}>
            © {currentYear} {t('footer.brand')}. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://teslacustomwraps.top/privacy" 
              className={`text-xs ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700'} transition-colors tracking-wide`}
            >
              {t('footer.privacy')}
            </a>
            <a 
              href="https://teslacustomwraps.top/terms" 
              className={`text-xs ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700'} transition-colors tracking-wide`}
            >
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
