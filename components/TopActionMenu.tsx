import React from 'react';
import { Icon } from './icons.tsx';

interface BottomActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BottomActionMenu: React.FC<BottomActionMenuProps> = ({ isOpen, onClose, onEdit, onDelete }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-surface-container-high-light dark:bg-surface-container-high-dark shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} rounded-t-2xl`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center gap-4">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-on-surface-light dark:text-on-surface-dark hover:bg-surface-container-highest-light dark:hover:bg-surface-container-highest-dark"
          >
            <Icon name="pencil" className="w-5 h-5" />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10"
          >
            <Icon name="trash" className="w-5 h-5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomActionMenu;