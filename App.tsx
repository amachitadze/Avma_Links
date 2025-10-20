import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LINK_DATA } from './constants.ts';
import type { LinkCategory, LinkItem } from './types.ts';
import Header from './components/Header.tsx';
import SearchBar from './components/SearchBar.tsx';
import CategorySection from './components/CategorySection.tsx';
import LinkModal from './components/LinkModal.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import AddLinkFab from './components/AddLinkFab.tsx';
import ViewControls from './components/ViewControls.tsx';
import ChromeBookmarksViewer from './components/ChromeBookmarksViewer.tsx';
import BottomActionMenu from './components/TopActionMenu.tsx';
import MoveModeControls from './components/MoveModeControls.tsx';
import { Icon } from './components/icons.tsx';

type ViewMode = 'grid' | 'list';
type ModalMode = 'add' | 'edit';
type AppView = 'main' | 'chromeImport';


interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  link?: LinkItem;
  categoryTitle?: string;
}

interface ConfirmModalState {
  isOpen:boolean;
  linkToDelete?: LinkItem;
}

interface ImportConfirmModalState {
  isOpen: boolean;
  dataToImport: LinkCategory[] | null;
}

interface ActionMenuState {
  isOpen: boolean;
  link?: LinkItem;
  categoryTitle?: string;
}

const App: React.FC = () => {
  const [linkData, setLinkData] = useState<LinkCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, mode: 'add' });
  const [confirmDeleteModalState, setConfirmDeleteModalState] = useState<ConfirmModalState>({ isOpen: false });
  const [confirmImportModalState, setConfirmImportModalState] = useState<ImportConfirmModalState>({ isOpen: false, dataToImport: null });
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [actionMenuState, setActionMenuState] = useState<ActionMenuState>({ isOpen: false });
  
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [linkDataBeforeMove, setLinkDataBeforeMove] = useState<LinkCategory[] | null>(null);

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- New Server Sync Logic ---

  // Load data on initial mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Try fetching from the server
        const response = await fetch('/api/links');
        if (response.ok) {
          const serverData = await response.json();
          setLinkData(serverData);
          localStorage.setItem('linkData', JSON.stringify(serverData));
          console.log("Data loaded from server and cached locally.");
        } else {
          // 404 or other error means no data on server yet, or server is down.
          // Fallback to localStorage.
          throw new Error('Server not reached or no data found.');
        }
      } catch (error) {
        console.warn("Could not fetch from server. Falling back to local data.", error);
        // 2. Fallback to localStorage
        const savedData = localStorage.getItem('linkData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setLinkData(parsedData);
            } else {
              setLinkData(LINK_DATA); // Local storage is empty/invalid
            }
          } catch (e) {
            setLinkData(LINK_DATA); // Parsing error
          }
        } else {
          // 3. Fallback to default data if nothing else is available
          setLinkData(LINK_DATA);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Save data to server (debounced) and localStorage whenever it changes
  const saveDataToServer = useCallback(async (data: LinkCategory[]) => {
    try {
      await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkData: data }),
      });
      console.log("Data successfully synced with the server.");
    } catch (error) {
      console.error("Failed to sync data with the server. It's saved locally.", error);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    // Save to local cache immediately for responsiveness
    localStorage.setItem('linkData', JSON.stringify(linkData));
    
    // Debounce the server save call to avoid spamming the API on rapid changes
    const handler = setTimeout(() => {
      saveDataToServer(linkData);
    }, 1000); // Wait 1 second after the last change to save

    return () => {
      clearTimeout(handler);
    };
  }, [linkData, isLoading, saveDataToServer]);
  
  // --- End of Server Sync Logic ---


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    if (draggedItemId) {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
  }, [draggedItemId]);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      setInstallPrompt(null);
    });
  };

  const filteredLinkData = useMemo(() => {
    if (!searchQuery) return linkData;
    const lowercasedQuery = searchQuery.toLowerCase();
    return linkData
      .map(category => ({
        ...category,
        links: category.links.filter(
          link =>
            link.name.toLowerCase().includes(lowercasedQuery) ||
            (link.description && link.description.toLowerCase().includes(lowercasedQuery)) ||
            link.url.toLowerCase().includes(lowercasedQuery)
        ),
      }))
      .filter(category => category.links.length > 0);
  }, [linkData, searchQuery]);

  const allCategoryTitles = useMemo(() => linkData.map(c => c.title), [linkData]);

  const handleAddLinkClick = () => setModalState({ isOpen: true, mode: 'add' });
  const handleEditLink = (link: LinkItem, categoryTitle: string) => setModalState({ isOpen: true, mode: 'edit', link, categoryTitle });
  const handleDeleteLink = (link: LinkItem) => setConfirmDeleteModalState({ isOpen: true, linkToDelete: link });

  const confirmDelete = () => {
    if (!confirmDeleteModalState.linkToDelete) return;
    setLinkData(prevData =>
      prevData.map(category => ({
        ...category,
        links: category.links.filter(link => link.id !== confirmDeleteModalState.linkToDelete?.id),
      })).filter(category => category.links.length > 0)
    );
    setConfirmDeleteModalState({ isOpen: false });
  };

  const handleSaveLink = (link: LinkItem, categoryTitle: string, originalId?: string) => {
    const getFavicon = (url: string) => `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
    const newLink = { ...link, faviconUrl: getFavicon(link.url) };

    if (modalState.mode === 'add') {
      setLinkData(prevData => {
        const categoryExists = prevData.some(c => c.title === categoryTitle);
        if (categoryExists) {
          return prevData.map(c =>
            c.title === categoryTitle ? { ...c, links: [...c.links, newLink] } : c
          );
        } else {
          return [...prevData, { title: categoryTitle, links: [newLink] }];
        }
      });
    } else { // Edit mode
      setLinkData(prevData => {
        const dataWithLinkRemoved = prevData.map(category => ({
          ...category,
          links: category.links.filter(l => l.id !== (originalId || link.id)),
        }));
        const categoryExists = dataWithLinkRemoved.some(c => c.title === categoryTitle);
        let newData;
        if (categoryExists) {
          newData = dataWithLinkRemoved.map(c =>
            c.title === categoryTitle ? { ...c, links: [...c.links, newLink] } : c
          );
        } else {
          newData = [...dataWithLinkRemoved, { title: categoryTitle, links: [newLink] }];
        }
        return newData.filter(c => c.links.length > 0);
      });
    }
    setModalState({ isOpen: false, mode: 'add' });
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(linkData, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "avma-links-backup.json";
    link.click();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };
  
  const handleImportChrome = () => {
    setCurrentView('chromeImport');
  };
  
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not a text file");
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.every(cat => cat.title && Array.isArray(cat.links))) {
          setConfirmImportModalState({ isOpen: true, dataToImport: data });
        } else {
          alert('Invalid file format.');
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert('Error reading or parsing the file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const confirmImport = () => {
    if (confirmImportModalState.dataToImport) {
      setLinkData(confirmImportModalState.dataToImport);
    }
    setConfirmImportModalState({ isOpen: false, dataToImport: null });
  };

  const handleDragStart = (id: string) => setDraggedItemId(id);
  const handleDragEnd = () => setDraggedItemId(null);

  const handleCategoryDrop = (sourceTitle: string, destTitle: string) => {
    setLinkData(prevData => {
      const items = [...prevData];
      const sourceIndex = items.findIndex(c => c.title === sourceTitle);
      const destIndex = items.findIndex(c => c.title === destTitle);
      if (sourceIndex === -1 || destIndex === -1 || sourceIndex === destIndex) return prevData;

      const [removed] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, removed);
      return items;
    });
  };

  const handleLinkDrop = (destCategoryTitle: string, sourceId: string, sourceCategoryTitle: string, destId: string | null) => {
    if (sourceCategoryTitle === destCategoryTitle && sourceId === destId) return;

    setLinkData(prevData => {
      let movedLink: LinkItem | undefined;
      const dataWithLinkRemoved = prevData.map(category => {
          if (category.title === sourceCategoryTitle) {
              const linkIndex = category.links.findIndex(l => l.id === sourceId);
              if (linkIndex > -1) {
                  [movedLink] = category.links.splice(linkIndex, 1);
              }
          }
          return category;
      });

      if (!movedLink) return prevData;

      const dataWithLinkAdded = dataWithLinkRemoved.map(category => {
          if (category.title === destCategoryTitle) {
              const links = [...category.links];
              if (destId === null) {
                  links.push(movedLink!);
              } else {
                  const destIndex = links.findIndex(l => l.id === destId);
                  if (destIndex > -1) {
                      links.splice(destIndex, 0, movedLink!);
                  } else {
                      links.push(movedLink!);
                  }
              }
              return { ...category, links };
          }
          return category;
      });

      return dataWithLinkAdded.filter(c => c.links.length > 0);
    });
  };
  
  const handleShowActionMenu = (link: LinkItem, categoryTitle: string) => {
    setActionMenuState({ isOpen: true, link, categoryTitle });
  };
  
  const handleCloseActionMenu = () => setActionMenuState({ isOpen: false });

  const handleEditFromActionMenu = () => {
    if (actionMenuState.link && actionMenuState.categoryTitle) {
      handleEditLink(actionMenuState.link, actionMenuState.categoryTitle);
    }
    handleCloseActionMenu();
  };

  const handleDeleteFromActionMenu = () => {
    if (actionMenuState.link) {
      handleDeleteLink(actionMenuState.link);
    }
    handleCloseActionMenu();
  };

  const handleCancelMove = () => {
    if (linkDataBeforeMove) {
      setLinkData(linkDataBeforeMove);
    }
    setIsMoveMode(false);
    setLinkDataBeforeMove(null);
  };
  
  const handleSaveMove = () => {
    setIsMoveMode(false);
    setLinkDataBeforeMove(null);
    // The main useEffect will handle saving the final state to the server
  };
  
  const handleToggleMoveMode = () => {
    if (isMoveMode) {
      handleCancelMove();
    } else {
      setLinkDataBeforeMove(JSON.parse(JSON.stringify(linkData))); // Deep copy
      setIsMoveMode(true);
    }
  };

  const isSearchActive = searchQuery.length > 0;
  const displayData = isSearchActive ? filteredLinkData : linkData;

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-on-surface-light dark:text-on-surface-dark">
            <div className="flex items-center gap-4">
                <Icon name="loading" className="w-8 h-8 animate-spin" />
                <span className="text-xl">Loading your links...</span>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-on-surface-light dark:text-on-surface-dark min-h-screen transition-colors duration-300">
      <Header
        theme={theme}
        setTheme={setTheme}
        onImport={handleImport}
        onExport={handleExport}
        onImportChrome={handleImportChrome}
        onToggleMoveMode={handleToggleMoveMode}
        onInstallClick={handleInstallClick}
        showInstallButton={!!installPrompt}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center mb-8 gap-4">
          <div className="w-full sm:max-w-md flex-grow relative">
            {currentView === 'main' && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          </div>
          <ViewControls viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {currentView === 'main' ? (
           <>
            {displayData.length > 0 ? (
              <div className="space-y-10">
                {displayData.map(category => (
                  <CategorySection
                    key={category.title}
                    category={category}
                    viewMode={viewMode}
                    onShowActionMenu={handleShowActionMenu}
                    isEditable={true}
                    isMoveMode={isMoveMode && !isSearchActive}
                    draggedItemId={draggedItemId}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onCategoryDrop={handleCategoryDrop}
                    onLinkDrop={handleLinkDrop}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h2 className="text-2xl font-medium text-on-surface-variant-light dark:text-on-surface-variant-dark">
                  {isSearchActive ? "No results found" : "No links yet"}
                </h2>
                <p className="mt-2 text-on-surface-variant-light dark:text-on-surface-variant-dark">
                  {isSearchActive ? "Try adjusting your search query." : "Add a link to get started!"}
                </p>
              </div>
            )}
          </>
        ) : (
          <ChromeBookmarksViewer 
             viewMode={viewMode} 
             onBack={() => setCurrentView('main')}
          />
        )}
      </main>

      {!isMoveMode && currentView === 'main' && <AddLinkFab onClick={handleAddLinkClick} />}
      {isMoveMode && <MoveModeControls onSave={handleSaveMove} onCancel={handleCancelMove} />}
      
      <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".json" className="hidden" />

      <LinkModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'add' })}
        onSave={handleSaveLink}
        linkToEdit={modalState.link}
        categoryTitle={modalState.categoryTitle}
        allCategories={allCategoryTitles}
        mode={modalState.mode}
      />

      <ConfirmationModal
        isOpen={confirmDeleteModalState.isOpen}
        onClose={() => setConfirmDeleteModalState({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Link"
        message={`Are you sure you want to delete "${confirmDeleteModalState.linkToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-error-light dark:bg-error-dark text-on-error-light dark:text-on-error-dark"
      />
      
      <ConfirmationModal
        isOpen={confirmImportModalState.isOpen}
        onClose={() => setConfirmImportModalState({ isOpen: false, dataToImport: null })}
        onConfirm={confirmImport}
        title="Import Data"
        message="This will overwrite all your current links and sync the new data to the server. Are you sure?"
        confirmText="Import"
        confirmButtonClass="bg-primary-light dark:bg-primary-dark text-on-primary-light dark:text-on-primary-dark"
      />

      <BottomActionMenu
        isOpen={actionMenuState.isOpen}
        onClose={handleCloseActionMenu}
        onEdit={handleEditFromActionMenu}
        onDelete={handleDeleteFromActionMenu}
      />
    </div>
  );
};

export default App;