import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/entrenador/', '/cliente/', '/api/', '/cliente-espera/'],
      },
    ],
    sitemap: 'https://gimnasio.com/sitemap.xml',
  }
}
