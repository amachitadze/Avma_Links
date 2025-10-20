import React from 'react';
import { Icon } from './icons.tsx';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="w-full sm:max-w-md flex-grow relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Icon name="search" className="h-5 w-5 text-on-surface-variant-light dark:text-on-surface-variant-dark" />
      </div>
      <input
        type="text"
        placeholder="Search links..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 border border-outline-light dark:border-outline-dark rounded-full bg-surface-container-low-light dark:bg-surface-container-low-dark text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark placeholder-on-surface-variant-light dark:placeholder-on-surface-variant-dark"
      />
    </div>
  );
};

export default SearchBar;