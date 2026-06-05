export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  return staticRoutes;
}
