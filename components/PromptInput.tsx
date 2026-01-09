import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-3">
      <label htmlFor="prompt" className={`block text-xs font-semibold tracking-wider uppercase ${
        isDark ? 'text-zinc-400' : 'text-zinc-600'
      }`}>
        {t('main.designTheme')}
      </label>
      <div className="relative">
        <textarea
          id="prompt"
          rows={4}
          className={`block w-full rounded border text-sm p-4 resize-none transition-all duration-300 ${
            isDark
              ? 'bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white'
              : 'bg-white border-zinc-300 text-black placeholder-zinc-400 focus:border-black focus:ring-1 focus:ring-black'
          }`}
          placeholder={t('main.designThemePlaceholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <div className={`absolute bottom-3 right-3 text-[10px] font-mono ${
          isDark ? 'text-zinc-600' : 'text-zinc-500'
        }`}>
          {value.length} CHARS
        </div>
      </div>
      <p className={`text-xs leading-relaxed ${
        isDark ? 'text-zinc-500' : 'text-zinc-600'
      }`}>
        {t('main.designThemeHelp')}
      </p>
    </div>
  );
};