export interface Author {
  id: 'marcel-allen';
  name: string;
  role: string;
  bio: string;
  image: string;
  url: string;
}

export const authors: Record<Author['id'], Author> = {
  'marcel-allen': {
    id: 'marcel-allen',
    name: 'Marcel Allen',
    role: 'Founder, Nexli Automation',
    bio: 'Marcel Allen is the founder of Nexli Automation, a CPA firm growth agency. He builds the Digital Rainmaker System, the website, AI intake automation, client portal, and Google review engine that established CPA firms use to land high-value tax advisory clients without adding headcount.',
    image: '/Founder%20Photos/marcel-headshot-2.png',
    url: '/about',
  },
};

export const getAuthor = (id: Author['id']) => authors[id];
