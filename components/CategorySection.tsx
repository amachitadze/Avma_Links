import React, { useState } from 'react';
import type { LinkCategory, LinkItem, ViewMode } from '../types.ts';
import LinkCard from './LinkCard.tsx';
import { Icon } from './icons.tsx';

interface CategorySectionProps {
  category: LinkCategory;
  viewMode: ViewMode;
  onShowActionMenu: (link: LinkItem, categoryTitle: string) => void;
  isEditable: boolean;
  isMoveMode: boolean;
  draggedItemId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onCategoryDrop: (sourceTitle: string, destTitle: string) => void;
  onLinkDrop: (destCategoryTitle: string, sourceId: string, sourceCategoryTitle: string, destId: string | null) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  category, 
  viewMode, 
  onShowActionMenu,
  isEditable,
  isMoveMode,
  draggedItemId,
  onDragStart,
  onDragEnd,
  onCategoryDrop,
  onLinkDrop
}) => {
  const [isOver, setIsOver] = useState(false);
  
  const containerClasses = 
    viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
    : viewMode === 'list' ? 'flex flex-col gap-3'
    : 'flex flex-col space-y-1 ml-2 pl-4 border-l-2 border-outline-variant-light/50 dark:border-outline-variant-dark/50';

  const isBeingDragged = draggedItemId === category.title;

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsOver(false);
    if (!isMoveMode || !isEditable) return;

    const type = e.dataTransfer.getData('type');
    if (type === 'category') {
      const sourceTitle = e.dataTransfer.getData('sourceCategoryTitle');
      if (sourceTitle && sourceTitle !== category.title) {
        onCategoryDrop(sourceTitle, category.title);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (isMoveMode && isEditable) {
      e.preventDefault();
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (isMoveMode && isEditable && draggedItemId && draggedItemId !== category.title) {
        setIsOver(true);
    }
  };

  const handleLinkContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMoveMode || !isEditable) return;
    
    const type = e.dataTransfer.getData('type');
    if (type === 'link') {
      const sourceLinkId = e.dataTransfer.getData('sourceLinkId');
      const sourceCategoryTitle = e.dataTransfer.getData('sourceCategoryTitle');
      if (sourceLinkId) {
        onLinkDrop(category.title, sourceLinkId, sourceCategoryTitle, null);
      }
    }
  };

  return (
    <section
      draggable={isMoveMode && isEditable}
      onDragStart={(e) => {
        if (!isMoveMode || !isEditable) return;
        e.dataTransfer.setData('type', 'category');
        e.dataTransfer.setData('sourceCategoryTitle', category.title);
        onDragStart(category.title);
      }}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`transition-all duration-200 rounded-2xl p-1 ${isBeingDragged ? 'opacity-40' : ''} ${isOver ? 'ring-2 ring-primary-light dark:ring-primary-dark' : ''}`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className={`text-xl font-medium text-on-surface-variant-light dark:text-on-surface-variant-dark ${isMoveMode && isEditable ? 'cursor-grab' : ''}`}>
          {category.title}
        </h2>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center text-sm px-3 py-1 rounded-full text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors focus:outline-none"
          aria-label="Back to top"
        >
          <span className="mr-1.5">Back to Top</span>
          <Icon name="arrow-up" className="w-4 h-4" />
        </button>
      </div>
      <div 
        className={containerClasses}
        onDragOver={(e) => {
           if (isMoveMode && isEditable) {
             e.preventDefault();
             e.stopPropagation();
           }
        }}
        onDrop={handleLinkContainerDrop}
      >
        {category.links.map(link => (
          <LinkCard 
            key={link.id} 
            link={link} 
            viewMode={viewMode}
            onShowActionMenu={onShowActionMenu}
            isEditable={isEditable}
            isMoveMode={isMoveMode}
            categoryTitle={category.title}
            draggedItemId={draggedItemId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onLinkDrop={onLinkDrop}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;