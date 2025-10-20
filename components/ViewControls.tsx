import React from 'react';
import { Icon } from './icons.tsx';
import type { ViewMode } from '../types.ts';

interface ViewControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({ viewMode, setViewMode }) => {
  const buttonClasses = (isActive: boolean) =>
    `p-2 rounded-lg ${
      isActive
        ? 'bg-primary-container-light text-on-primary-container-light dark:bg-primary-container-dark dark:text-on-primary-container-dark'
        : 'hover:bg-surface-container-highest-light dark:hover:bg-surface-container-highest-dark text-on-surface-variant-light dark:text-on-surface-variant-dark'
    }`;

  return (
    <div className="flex items-center space-x-1 p-1 rounded-xl bg-surface-container-light dark:bg-surface-container-dark">
      <button onClick={() => setViewMode('grid')} className={buttonClasses(viewMode === 'grid')} aria-label="Grid view">
        <Icon name="viewGrid" className="w-5 h-5" />
      </button>
      <button onClick={() => setViewMode('list')} className={buttonClasses(viewMode === 'list')} aria-label="List view">
        <Icon name="viewList" className="w-5 h-5" />
      </button>
      <button onClick={() => setViewMode('chrome')} className={buttonClasses(viewMode === 'chrome')} aria-label="Folder view">
        <Icon name="folder" className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewControls;