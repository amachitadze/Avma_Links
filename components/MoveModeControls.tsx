import React from 'react';

interface MoveModeControlsProps {
  onSave: () => void;
  onCancel: () => void;
}

const MoveModeControls: React.FC<MoveModeControlsProps> = ({ onSave, onCancel }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-container-high-light dark:bg-surface-container-high-dark shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-center items-center gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-full text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-8 py-2 rounded-full bg-primary-light dark:bg-primary-dark text-on-primary-light dark:text-on-primary-dark hover:opacity-90"
        >
          Save Layout
        </button>
      </div>
    </div>
  );
};

export default MoveModeControls;
