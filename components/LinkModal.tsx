import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { LinkItem } from '../types.ts';
import { Icon } from './icons.tsx';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: LinkItem, categoryTitle: string, originalId?: string) => string | null;
  linkToEdit?: LinkItem;
  categoryTitle?: string;
  allCategories: string[];
  mode: 'add' | 'edit';
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSave, linkToEdit, categoryTitle, allCategories, mode }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && linkToEdit && categoryTitle) {
        setName(linkToEdit.name);
        setUrl(linkToEdit.url);
        setDescription(linkToEdit.description || '');
        setCategory(categoryTitle);
        setIsNewCategory(false);
        setNewCategory('');
      } else {
        setName('');
        setUrl('');
        setDescription('');
        setCategory(allCategories.length > 0 ? allCategories[0] : '');
        setIsNewCategory(allCategories.length === 0);
        setNewCategory('');
      }
      setError(null); // Reset error when modal opens/changes
    }
  }, [isOpen, mode, linkToEdit, categoryTitle, allCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isNewCategory ? newCategory : category;
    if (!name || !url || !finalCategory) {
      setError('Name, URL, and Category are required.');
      return;
    }

    const savedLink: LinkItem = {
      id: linkToEdit?.id || `link-${Date.now()}`,
      name,
      url,
      description,
      faviconUrl: '', // Will be generated in App.tsx
    };
    
    const saveError = onSave(savedLink, finalCategory, linkToEdit?.id);
    if (saveError) {
      setError(saveError);
    } 
    // On success, the parent component closes the modal, so no `else` block is needed here.
  };

  if (!isOpen) return null;
  
  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-surface-container-high-light dark:bg-surface-container-high-dark rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-on-surface-variant-light dark:text-on-surface-variant-dark hover:bg-surface-container-highest-light dark:hover:bg-surface-container-highest-dark">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-on-surface-light dark:text-on-surface-dark">
          {mode === 'add' ? 'Add New Link' : 'Edit Link'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-3 text-sm bg-surface-light dark:bg-surface-container-highest-light border border-outline-light dark:border-outline-dark rounded-lg" role="alert">
              <Icon name="error" className="w-5 h-5 flex-shrink-0 text-error-light dark:text-error-dark" />
              <span className="text-error-light dark:text-error-dark font-medium">{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant-light dark:text-on-surface-variant-dark mb-1">Name</label>
            <input type="text" id="name" value={name} onChange={e => { setName(e.target.value); setError(null); }} required className="w-full input-style" />
          </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-on-surface-variant-light dark:text-on-surface-variant-dark mb-1">URL</label>
            <input type="url" id="url" value={url} onChange={e => { setUrl(e.target.value); setError(null); }} required className="w-full input-style" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-on-surface-variant-light dark:text-on-surface-variant-dark mb-1">Description (Optional)</label>
            <input type="text" id="description" value={description} onChange={e => { setDescription(e.target.value); setError(null); }} className="w-full input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant-light dark:text-on-surface-variant-dark mb-1">Category</label>
            {!isNewCategory && allCategories.length > 0 && (
              <select value={category} onChange={e => { setCategory(e.target.value); setError(null); }} className="w-full input-style mb-2">
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
            {isNewCategory && (
              <input type="text" placeholder="New category name" value={newCategory} onChange={e => { setNewCategory(e.target.value); setError(null); }} required className="w-full input-style mb-2" />
            )}
            <div className="flex items-center">
              <input type="checkbox" id="newCategory" checked={isNewCategory} onChange={e => setIsNewCategory(e.target.checked)} className="h-4 w-4 rounded border-outline-variant-light text-primary-light focus:ring-primary-light" />
              <label htmlFor="newCategory" className="ml-2 block text-sm text-on-surface-variant-light dark:text-on-surface-variant-dark">Create new category</label>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-full bg-primary-light dark:bg-primary-dark text-on-primary-light dark:text-on-primary-dark hover:opacity-90">
              Save
            </button>
          </div>
        </form>
      </div>
      <style>{`.input-style { background-color: var(--md-sys-color-surface-container-low-light); border: 1px solid var(--md-sys-color-outline-light); border-radius: 8px; padding: 10px 12px; transition: border-color 0.2s, box-shadow 0.2s; } .dark .input-style { background-color: var(--md-sys-color-surface-container-low-dark); border-color: var(--md-sys-color-outline-dark); color: var(--md-sys-color-on-surface-dark); } .input-style:focus { outline: none; border-color: var(--md-sys-color-primary-light); } .dark .input-style:focus { border-color: var(--md-sys-color-primary-dark); } select.input-style { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; } .dark select.input-style { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); }`}</style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default LinkModal;