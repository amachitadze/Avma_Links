import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.tsx';

interface HamburgerMenuProps {
  onImport: () => void;
  onExport: () => void;
  onImportChrome: () => void;
  onToggleMoveMode: () => void;
  showInstallButton: boolean;
  onInstall: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  onImport, 
  onExport, 
  onImportChrome, 
  onToggleMoveMode,
  showInstallButton,
  onInstall
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-full text-on-surface-variant-light dark:text-on-surface-variant-dark hover:bg-surface-container-highest-light dark:hover:bg-surface-container-highest-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Icon name="menu" className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-container-light dark:bg-surface-container-dark rounded-lg shadow-xl border border-outline-variant-light dark:border-outline-variant-dark z-50 py-2">
          <ul>
            {showInstallButton && (
              <>
                <li>
                  <button
                    onClick={() => { onInstall(); setIsOpen(false); }}
                    className="w-full flex items-center px-4 py-2 text-sm text-on-surface-light dark:text-on-surface-dark hover:bg-surface-container-high-light dark:hover:bg-surface-container-high-dark"
                  >
                    <Icon name="install" className="w-5 h-5 mr-3" />
                    <span>Install App</span>
                  </button>
                </li>
                <li className="my-1 h-px bg-outline-variant-light dark:bg-outline-variant-dark mx-2" />
              </>
            )}
            <li>
              <button
                onClick={() => { onToggleMoveMode(); setIsOpen(false); }}
                className="w-full flex items-center px-4 py-2 text-sm text-on-surface-light dark:text-on-surface-dark hover:bg-surface-container-high-light dark:hover:bg-surface-container-high-dark"
              >
                <Icon name="move" className="w-5 h-5 mr-3" />
                <span>Reorder Layout</span>
              </button>
            </li>
            <li className="my-1 h-px bg-outline-variant-light dark:bg-outline-variant-dark mx-2" />
            <li>
              <button
                onClick={() => { onImport(); setIsOpen(false); }}
                className="w-full flex items-center px-4 py-2 text-sm text-on-surface-light dark:text-on-surface-dark hover:bg-surface-container-high-light dark:hover:bg-surface-container-high-dark"
              >
                <Icon name="upload" className="w-5 h-5 mr-3" />
                <span>Import Data</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { onExport(); setIsOpen(false); }}
                className="w-full flex items-center px-4 py-2 text-sm text-on-surface-light dark:text-on-surface-dark hover:bg-surface-container-high-light dark:hover:bg-surface-container-high-dark"
              >
                <Icon name="download" className="w-5 h-5 mr-3" />
                <span>Export Data</span>
              </button>
            </li>
            <li className="my-1 h-px bg-outline-variant-light dark:bg-outline-variant-dark mx-2" />
            <li>
              <button
                onClick={() => { onImportChrome(); setIsOpen(false); }}
                className="w-full flex items-center px-4 py-2 text-sm text-on-surface-light dark:text-on-surface-dark hover:bg-surface-container-high-light dark:hover:bg-surface-container-high-dark"
              >
                <Icon name="chrome" className="w-5 h-5 mr-3" />
                <span>Import from Chrome</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
