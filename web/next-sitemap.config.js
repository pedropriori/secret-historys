/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://secret-historys.example.com',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*'],
};




