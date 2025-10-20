import React, { useState, useRef } from 'react';
import type { LinkItem, ViewMode } from '../types.ts';

interface LinkCardProps {
  link: LinkItem;
  viewMode: ViewMode;
  onShowActionMenu: (link: LinkItem, categoryTitle: string) => void;
  isEditable: boolean;
  isMoveMode: boolean;
  categoryTitle: string;
  draggedItemId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onLinkDrop: (destCategoryTitle: string, sourceId: string, sourceCategoryTitle: string, destId: string | null) => void;
}

const getHostname = (url: string): string => {
  if (typeof url !== 'string' || !url.trim()) {
    return '';
  }

  let fullUrl = url;
  // If the URL doesn't have a protocol, prepend https://
  // This handles "google.com" and "//google.com"
  if (!/^[a-z][a-z0-9+.-]*:/.test(url)) {
    fullUrl = `https://${url.replace(/^\/\//, '')}`;
  }

  try {
    const parsedUrl = new URL(fullUrl);
    // For non-http URLs, hostname is often empty, which is what we want.
    if (parsedUrl.protocol.startsWith('http')) {
        return parsedUrl.hostname;
    }
    return ''; // Don't show a "hostname" for mailto, tel, etc.
  } catch (e) {
    console.warn(`Could not get hostname for URL: "${url}"`);
    // Fallback for URLs that are still invalid after prefixing.
    // This grabs the part after an optional protocol/www and before the first slash.
    const domainMatch = url.trim().replace(/^(.*:)?(\/\/)?(www\.)?/, '').split('/')[0];
    return domainMatch || '';
  }
};


const LinkCard: React.FC<LinkCardProps> = ({ 
  link, 
  viewMode, 
  onShowActionMenu,
  isEditable,
  isMoveMode, 
  categoryTitle, 
  draggedItemId, 
  onDragStart,
  onDragEnd,
  onLinkDrop
}) => {
  const [isOver, setIsOver] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMoveMode) {
      e.preventDefault();
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isMoveMode && isEditable) {
      onShowActionMenu(link, categoryTitle);
    }
  };

  const isBeingDragged = draggedItemId === link.id;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    if (!isMoveMode || !isEditable) return;

    const type = e.dataTransfer.getData('type');
    const sourceLinkId = e.dataTransfer.getData('sourceLinkId');
    const sourceCategoryTitle = e.dataTransfer.getData('sourceCategoryTitle');

    if (type === 'link' && sourceLinkId && sourceLinkId !== link.id) {
      onLinkDrop(categoryTitle, sourceLinkId, sourceCategoryTitle, link.id);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isMoveMode && isEditable) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
     e.stopPropagation();
     if (isMoveMode && isEditable && !isBeingDragged) {
       setIsOver(true);
     }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsOver(false);
  };

  const sharedDragProps = {
    draggable: isMoveMode && isEditable,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
      if (!isMoveMode || !isEditable) return;
      e.stopPropagation();
      e.dataTransfer.setData('type', 'link');
      e.dataTransfer.setData('sourceLinkId', link.id);
      e.dataTransfer.setData('sourceCategoryTitle', categoryTitle);
      onDragStart(link.id);
    },
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onDragEnd();
    },
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };
  
  const wrapperClasses = `
    relative
    ${isBeingDragged ? 'opacity-40' : ''}
    ${isOver ? 'ring-2 ring-primary-light dark:ring-primary-dark rounded-lg' : ''}
    ${isMoveMode && isEditable ? 'cursor-grab' : ''}
  `;

  const gridViewLinkClasses = `
    group block p-4 bg-surface-container-low-light dark:bg-surface-container-low-dark rounded-2xl border
    hover:bg-surface-container-light dark:hover:bg-surface-container-dark hover:shadow-md transition-all 
    duration-300 transform hover:-translate-y-1 w-full h-full
    border-outline-variant-light dark:border-outline-variant-dark
  `;

  const listViewLinkClasses = `
    group flex items-center p-3 bg-surface-container-low-light dark:bg-surface-container-low-dark 
    rounded-xl border hover:bg-surface-container-light dark:hover:bg-surface-container-dark 
    transition-all duration-200 w-full h-full border-transparent
  `;
  
  const chromeViewLinkClasses = `
    group flex items-center p-1.5 rounded-md
    hover:bg-surface-container-light dark:hover:bg-surface-container-dark 
    transition-colors duration-200 w-full
  `;

  const cardContentGrid = (
    <div className="flex flex-col items-center text-center pointer-events-none">
      <img src={link.faviconUrl} alt={`${link.name} favicon`} className="w-12 h-12 mb-3 object-contain" />
      <h3 className="font-semibold text-on-surface-light dark:text-on-surface-dark truncate w-full">{link.name}</h3>
      {link.description && <p className="text-sm text-on-surface-variant-light dark:text-on-surface-variant-dark mt-1 truncate w-full">{link.description}</p>}
    </div>
  );
  
  const cardContentList = (
    <>
      <img src={link.faviconUrl} alt={`${link.name} favicon`} className="w-6 h-6 mr-4 object-contain pointer-events-none" />
      <div className="flex-grow pointer-events-none">
        <h3 className="font-medium text-on-surface-light dark:text-on-surface-dark">{link.name}</h3>
        {link.description && <p className="text-sm text-on-surface-variant-light dark:text-on-surface-variant-dark">{link.description}</p>}
      </div>
      <span className="text-xs text-on-surface-variant-light dark:text-on-surface-variant-dark opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {getHostname(link.url)}
      </span>
    </>
  );

  const cardContentChrome = (
    <>
      <img src={link.faviconUrl} alt={`${link.name} favicon`} className="w-5 h-5 mr-3 object-contain flex-shrink-0" />
      <div className="flex-grow truncate">
        <h3 className="font-normal text-sm text-on-surface-light dark:text-on-surface-dark truncate">{link.name}</h3>
      </div>
    </>
  );

  const anchorClasses = 
    viewMode === 'grid' ? gridViewLinkClasses 
    : viewMode === 'list' ? listViewLinkClasses 
    : chromeViewLinkClasses;
  
  const cardContent = 
    viewMode === 'grid' ? cardContentGrid 
    : viewMode === 'list' ? cardContentList 
    : cardContentChrome;

  return (
    <div
      ref={cardRef}
      className={wrapperClasses}
      {...sharedDragProps}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={anchorClasses}
        tabIndex={isMoveMode ? -1 : 0}
      >
        {cardContent}
      </a>
    </div>
  );
};

export default LinkCard;