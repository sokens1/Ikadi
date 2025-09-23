// Générateur de sitemap dynamique pour iKADI
export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (entries: SitemapEntry[]): string => {
  const baseUrl = 'https://ikadi.gabon.ga';
  
  const sitemapEntries = entries.map(entry => {
    const fullUrl = entry.url.startsWith('http') ? entry.url : `${baseUrl}${entry.url}`;
    const lastmod = entry.lastmod || new Date().toISOString().split('T')[0];
    const changefreq = entry.changefreq || 'weekly';
    const priority = entry.priority || 0.5;

    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;
};

// Routes statiques de l'application
export const staticRoutes: SitemapEntry[] = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0
  },
  {
    url: '/results',
    changefreq: 'hourly',
    priority: 0.9
  },
  {
    url: '/elections',
    changefreq: 'daily',
    priority: 0.8
  },
  {
    url: '/centers',
    changefreq: 'weekly',
    priority: 0.7
  },
  {
    url: '/voters',
    changefreq: 'weekly',
    priority: 0.6
  },
  {
    url: '/campaign',
    changefreq: 'daily',
    priority: 0.7
  }
];

// Fonction pour générer le sitemap complet
export const generateFullSitemap = (dynamicEntries: SitemapEntry[] = []): string => {
  const allEntries = [...staticRoutes, ...dynamicEntries];
  return generateSitemap(allEntries);
};
