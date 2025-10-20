export interface LinkItem {
  id: string;
  name: string;
  url: string;
  faviconUrl: string;
  description?: string;
}

export interface LinkCategory {
  title: string;
  links: LinkItem[];
}

export type ViewMode = 'grid' | 'list' | 'chrome';
