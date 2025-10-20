import React from 'react';
import { Icon } from './icons.tsx';
import HamburgerMenu from './HamburgerMenu.tsx';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onImport: () => void;
  onExport: () => void;
  onImportChrome: () => void;
  onToggleMoveMode: () => void;
  showInstallButton: boolean;
  onInstallClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  theme, 
  setTheme, 
  onImport, 
  onExport, 
  onImportChrome, 
  onToggleMoveMode,
  showInstallButton,
  onInstallClick,
}) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-surface-light dark:bg-surface-dark shadow-sm sticky top-0 z-40 border-b border-outline-variant-light dark:border-outline-variant-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <h1 className="text-2xl font-medium text-on-surface-light dark:text-on-surface-dark">
            Avma Links
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-on-surface-variant-light dark:text-on-surface-variant-dark hover:bg-surface-container-highest-light dark:hover:bg-surface-container-highest-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              aria-label="Toggle theme"
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-6 h-6" />
            </button>
            <HamburgerMenu 
              onImport={onImport} 
              onExport={onExport} 
              onImportChrome={onImportChrome} 
              onToggleMoveMode={onToggleMoveMode}
              showInstallButton={showInstallButton}
              onInstall={onInstallClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
