import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirm',
  confirmButtonClass = 'bg-primary-light dark:bg-primary-dark text-on-primary-light dark:text-on-primary-dark'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-high-light dark:bg-surface-container-high-dark rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-on-surface-light dark:text-on-surface-dark">
          {title}
        </h2>
        <p className="text-on-surface-variant-light dark:text-on-surface-variant-dark mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-full hover:opacity-90 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmationModal;