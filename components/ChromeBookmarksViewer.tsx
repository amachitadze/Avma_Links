import React, { useState, useRef } from 'react';
import type { LinkCategory, LinkItem } from '../types.ts';
import CategorySection from './CategorySection.tsx';
import { Icon } from './icons.tsx';

interface ChromeBookmarksViewerProps {
  viewMode: 'grid' | 'list';
  onBack: () => void;
}

const getFavicon = (url: string) => `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;

const parseBookmarksHTML = (htmlString: string): LinkCategory[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const categories: LinkCategory[] = [];

    const processNode = (node: Element, parentCategoryList: LinkCategory[], parentLinkList: LinkItem[]) => {
        // Case 1: Node is a folder (<DT><H3>...</H3></DT>)
        if (node.tagName.toUpperCase() === 'DT' && node.querySelector(':scope > h3')) {
            const h3 = node.querySelector(':scope > h3')!;
            const categoryTitle = h3.textContent?.trim() || 'Untitled Folder';
            const newCategory: LinkCategory = { title: categoryTitle, links: [] };

            let contentList = node.nextElementSibling;
            if (contentList && contentList.tagName.toUpperCase() === 'P') {
                contentList = contentList.firstElementChild;
            }

            if (contentList && contentList.tagName.toUpperCase() === 'DL') {
                for (const child of Array.from(contentList.children)) {
                    // Pass the new category's link array for the children to populate
                    processNode(child, parentCategoryList, newCategory.links);
                }
            }
            
            if (newCategory.links.length > 0) {
                parentCategoryList.push(newCategory);
            }
        // Case 2: Node is a link (<DT><A>...</A></DT>)
        } else if (node.tagName.toUpperCase() === 'DT' && node.querySelector(':scope > a')) {
            const a = node.querySelector(':scope > a')!;
            const url = a.getAttribute('href');
            if (url && (url.startsWith('http') || url.startsWith('https'))) {
                try {
                    const hostname = new URL(url).hostname;
                    parentLinkList.push({
                        id: `chrome-${Date.now()}-${Math.random()}`,
                        name: a.textContent?.trim() || 'Untitled Link',
                        url,
                        faviconUrl: getFavicon(url),
                        description: hostname
                    });
                } catch (e) {
                    console.warn(`Skipping invalid URL: ${url}`);
                }
            }
        // Case 3: Node is a container, recurse into its children
        } else if (node.tagName.toUpperCase() === 'P' || node.tagName.toUpperCase() === 'DL') {
            for (const child of Array.from(node.children)) {
                processNode(child, parentCategoryList, parentLinkList);
            }
        }
    };

    const mainDl = doc.querySelector('h1 + dl, body > dl');
    if (mainDl) {
        const rootLinks: LinkItem[] = [];
        // Start processing from the children of the main DL
        for (const child of Array.from(mainDl.children)) {
            processNode(child, categories, rootLinks);
        }

        if (rootLinks.length > 0) {
            categories.unshift({ title: 'Imported Bookmarks', links: rootLinks });
        }
    }

    return categories;
};


const ChromeBookmarksViewer: React.FC<ChromeBookmarksViewerProps> = ({ viewMode, onBack }) => {
  const [bookmarks, setBookmarks] = useState<LinkCategory[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setBookmarks(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read as text.");
        
        const parsedData = parseBookmarksHTML(text);
        if (parsedData.length === 0) {
            throw new Error("No bookmarks found in the file. Make sure it's a valid Chrome bookmarks export.");
        }
        setBookmarks(parsedData);
      } catch (err: any) {
        console.error("Error parsing bookmarks file:", err);
        setError(err.message || 'Error reading or parsing the file.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setIsLoading(false);
        setError('Failed to read the file.');
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const dummyAction = () => {}; // No actions on imported bookmarks

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-on-surface-light dark:text-on-surface-dark">
          Chrome Bookmarks
        </h2>
         <button
            onClick={onBack}
            className="px-6 py-2 rounded-full text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors"
          >
            Back to Avma Links
        </button>
      </div>

      {!bookmarks && !isLoading && !error && (
        <div className="text-center py-16 px-6 rounded-2xl bg-surface-container-low-light dark:bg-surface-container-low-dark border-2 border-dashed border-outline-variant-light dark:border-outline-variant-dark">
            <Icon name="chrome" className="w-16 h-16 mx-auto text-on-surface-variant-light dark:text-on-surface-variant-dark" />
            <h3 className="mt-4 text-xl font-medium">Import Your Chrome Bookmarks</h3>
            <p className="mt-2 max-w-2xl mx-auto text-on-surface-variant-light dark:text-on-surface-variant-dark">
                To get started, export your bookmarks from Chrome as an HTML file. <br />
                In Chrome, go to <code className="bg-surface-container-high-light dark:bg-surface-container-high-dark px-1.5 py-0.5 rounded-md text-sm">Bookmarks → Bookmark Manager → (⋮) → Export bookmarks</code>.
            </p>
            <button
                onClick={handleUploadClick}
                className="mt-6 px-6 py-2.5 rounded-full bg-primary-light dark:bg-primary-dark text-on-primary-light dark:text-on-primary-dark hover:opacity-90 transition-opacity font-medium"
            >
                Upload bookmarks.html
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".html" className="hidden" />
        </div>
      )}

      {isLoading && (
         <div className="text-center py-20">
            <p className="text-lg text-on-surface-variant-light dark:text-on-surface-variant-dark">Parsing your bookmarks...</p>
         </div>
      )}

      {error && (
        <div className="text-center py-16 px-6 rounded-2xl bg-error-light/10 dark:bg-error-dark/10 border border-error-light dark:border-error-dark">
            <h3 className="text-xl font-medium text-error-light dark:text-error-dark">Import Failed</h3>
            <p className="mt-2 text-on-surface-variant-light dark:text-on-surface-variant-dark">{error}</p>
            <button
                onClick={handleUploadClick}
                className="mt-6 px-6 py-2 rounded-full bg-primary-light dark:bg-primary-dark text-on-primary-light dark:text-on-primary-dark hover:opacity-90 transition-opacity"
            >
                Try Again
            </button>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".html" className="hidden" />
        </div>
      )}

      {bookmarks && (
        <div className="space-y-10">
          {bookmarks.map(category => (
            <CategorySection
              key={category.title}
              category={category}
              viewMode={viewMode}
              onShowActionMenu={dummyAction}
              // FIX: Added missing 'isEditable' prop. The bookmarks viewer is read-only.
              isEditable={false}
              isMoveMode={false} // No moving allowed
              draggedItemId={null}
              onDragStart={dummyAction}
              onDragEnd={dummyAction}
              onCategoryDrop={() => {}}
              onLinkDrop={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChromeBookmarksViewer;