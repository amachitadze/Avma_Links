import type { LinkCategory } from './types.ts';

const getFavicon = (url: string) => `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;

export const LINK_DATA: LinkCategory[] = [
  {
    title: 'Google Apps',
    links: [
      { id: 'g-1', name: 'Gmail', url: 'https://mail.google.com/', faviconUrl: getFavicon('https://mail.google.com/'), description: 'Email service' },
      { id: 'g-2', name: 'Drive', url: 'https://drive.google.com/', faviconUrl: getFavicon('https://drive.google.com/'), description: 'Cloud storage' },
      { id: 'g-3', name: 'Calendar', url: 'https://calendar.google.com/', faviconUrl: getFavicon('https://calendar.google.com/'), description: 'Scheduling app' },
      { id: 'g-4', name: 'Photos', url: 'https://photos.google.com/', faviconUrl: getFavicon('https://photos.google.com/'), description: 'Photo hosting' },
      { id: 'g-5', name: 'Keep', url: 'https://keep.google.com/', faviconUrl: getFavicon('https://keep.google.com/'), description: 'Note-taking' },
      { id: 'g-6', name: 'Meet', url: 'https://meet.google.com/', faviconUrl: getFavicon('https://meet.google.com/'), description: 'Video conferencing' },
    ],
  },
  {
    title: 'Development',
    links: [
      { id: 'd-1', name: 'GitHub', url: 'https://github.com/', faviconUrl: getFavicon('https://github.com/'), description: 'Code hosting' },
      { id: 'd-2', name: 'GitLab', url: 'https://gitlab.com/', faviconUrl: getFavicon('https://gitlab.com/'), description: 'DevOps platform' },
      { id: 'd-3', name: 'Stack Overflow', url: 'https://stackoverflow.com/', faviconUrl: getFavicon('https://stackoverflow.com/'), description: 'Q&A for programmers' },
      { id: 'd-4', name: 'VS Code', url: 'https://vscode.dev/', faviconUrl: getFavicon('https://vscode.dev/'), description: 'Online code editor' },
      { id: 'd-5', name: 'npm', url: 'https://www.npmjs.com/', faviconUrl: getFavicon('https://www.npmjs.com/'), description: 'Package manager' },
      { id: 'd-6', name: 'Postman', url: 'https://web.postman.co/', faviconUrl: getFavicon('https://web.postman.co/'), description: 'API platform' },
    ],
  },
  {
    title: 'AI / ML',
    links: [
      { id: 'a-1', name: 'ChatGPT', url: 'https://chat.openai.com/', faviconUrl: getFavicon('https://chat.openai.com/'), description: 'Conversational AI' },
      { id: 'a-2', name: 'Google Gemini', url: 'https://gemini.google.com/', faviconUrl: getFavicon('https://gemini.google.com/'), description: 'Creative AI assistant' },
      { id: 'a-3', name: 'Hugging Face', url: 'https://huggingface.co/', faviconUrl: getFavicon('https://huggingface.co/'), description: 'AI community' },
      { id: 'a-4', name: 'Perplexity AI', url: 'https://www.perplexity.ai/', faviconUrl: getFavicon('https://www.perplexity.ai/'), description: 'Conversational search' },
    ],
  },
  {
    title: 'Hosting / Cloud',
    links: [
      { id: 'h-1', name: 'Vercel', url: 'https://vercel.com/', faviconUrl: getFavicon('https://vercel.com/'), description: 'Frontend cloud' },
      { id: 'h-2', name: 'Netlify', url: 'https://www.netlify.com/', faviconUrl: getFavicon('https://www.netlify.com/'), description: 'Web development platform' },
      { id: 'h-3', name: 'Firebase', url: 'https://console.firebase.google.com/', faviconUrl: getFavicon('https://console.firebase.google.com/'), description: 'App development' },
      { id: 'h-4', name: 'AWS Console', url: 'https://aws.amazon.com/console/', faviconUrl: getFavicon('https://aws.amazon.com/console/'), description: 'Cloud computing' },
      { id: 'h-5', name: 'Cloudflare', url: 'https://www.cloudflare.com/dash', faviconUrl: getFavicon('https://www.cloudflare.com/dash'), description: 'Web performance' },
    ],
  },
  {
    title: 'Design',
    links: [
      { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com/', faviconUrl: getFavicon('https://www.figma.com/'), description: 'Collaborative design' },
      { id: 'ds-2', name: 'Dribbble', url: 'https://dribbble.com/', faviconUrl: getFavicon('https://dribbble.com/'), description: 'Design portfolio' },
      { id: 'ds-3', name: 'Canva', url: 'https://www.canva.com/', faviconUrl: getFavicon('https://www.canva.com/'), description: 'Graphic design tool' },
      { id: 'ds-4', name: 'Coolors', url: 'https://coolors.co/', faviconUrl: getFavicon('https://coolors.co/'), description: 'Color palettes' },
      { id: 'ds-5', name: 'Unsplash', url: 'https://unsplash.com/', faviconUrl: getFavicon('https://unsplash.com/'), description: 'Stock photos' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { id: 't-1', name: 'Notion', url: 'https://www.notion.so/', faviconUrl: getFavicon('https://www.notion.so/'), description: 'Workspace tool' },
      { id: 't-2', name: 'Trello', url: 'https://trello.com/', faviconUrl: getFavicon('https://trello.com/'), description: 'Project management' },
      { id: 't-3', name: 'Slack', url: 'https://slack.com/', faviconUrl: getFavicon('https://slack.com/'), description: 'Team communication' },
      { id: 't-4', name: 'Discord', url: 'https://discord.com/app', faviconUrl: getFavicon('https://discord.com/app'), description: 'VoIP and chat' },
    ],
  },
  {
    title: 'Social',
    links: [
      { id: 's-1', name: 'LinkedIn', url: 'https://www.linkedin.com/', faviconUrl: getFavicon('https://www.linkedin.com/'), description: 'Professional network' },
      { id: 's-2', name: 'Twitter / X', url: 'https://twitter.com/', faviconUrl: getFavicon('https://twitter.com/'), description: 'Social media' },
      { id: 's-3', name: 'Instagram', url: 'https://www.instagram.com/', faviconUrl: getFavicon('https://www.instagram.com/'), description: 'Photo sharing' },
      { id: 's-4', name: 'Facebook', url: 'https://www.facebook.com/', faviconUrl: getFavicon('https://www.facebook.com/'), description: 'Social network' },
    ],
  },
  {
    title: 'Others',
    links: [
      { id: 'o-1', name: 'YouTube', url: 'https://www.youtube.com/', faviconUrl: getFavicon('https://www.youtube.com/'), description: 'Video sharing' },
      { id: 'o-2', name: 'Medium', url: 'https://medium.com/', faviconUrl: getFavicon('https://medium.com/'), description: 'Online publishing' },
      { id: 'o-3', name: 'Spotify', url: 'https://open.spotify.com/', faviconUrl: getFavicon('https://open.spotify.com/'), description: 'Music streaming' },
    ],
  },
];