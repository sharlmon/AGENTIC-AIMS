/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://gemarkart.co.ke',
  generateRobotsTxt: true,
  exclude: [
    '/dashboard/**',
    '/sign-in/**',
    '/sign-up/**',
    '/cart',
    '/checkout',
    '/orders/**',
    '/tracking/**',
    '/user-dashboard/**',
    '/api/**',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/sign-in/',
          '/sign-up/',
          '/cart',
          '/checkout',
          '/orders/',
          '/tracking/',
          '/user-dashboard/',
          '/api/',
        ],
      },
    ],
    additionalSitemaps: [],
  },
  // Custom transformation function for dynamic pages
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.lastmod,
      news: config.news,
      video: config.video,
    }
  },
}
