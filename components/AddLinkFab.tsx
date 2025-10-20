import React from 'react';
import { Icon } from './icons.tsx';

interface AddLinkFabProps {
  onClick: () => void;
}

const AddLinkFab: React.FC<AddLinkFabProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-primary-container-light dark:bg-primary-container-dark text-on-primary-container-light dark:text-on-primary-container-dark p-4 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-shadow transform hover:scale-105"
      aria-label="Add new link"
    >
      <Icon name="plus" className="w-8 h-8" />
    </button>
  );
};

export default AddLinkFab;