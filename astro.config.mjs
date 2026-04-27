import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  integrations: [sitemap()],
  trailingSlash: 'never',
  
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/inter-v20-cyrillic_latin-regular.woff2'],
            weight: '400',
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/inter-v20-cyrillic_latin-500.woff2'],
            weight: '500',
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/inter-v20-cyrillic_latin-700.woff2'],
            weight: '700',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Libertinus Serif',
      cssVariable: '--font-libertinus',
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/libertinus-serif-v1-cyrillic_latin-regular.woff2'],
            weight: '400',
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/libertinus-serif-v1-cyrillic_latin-600.woff2'],
            weight: '600',
            style: 'normal',
          },
          {
            src: ['./src/assets/fonts/libertinus-serif-v1-cyrillic_latin-700.woff2'],
            weight: '700',
            style: 'normal',
          },
        ],
      },
    },
  ],
});