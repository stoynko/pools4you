
2. Website monitoring
   1. 📊 Analytics
      • Google Analytics (free, powerful, a bit bloated)
      • Plausible Analytics (clean, paid, better UX)

   2. 🚨 Uptime monitoring
      • UptimeRobot (free tier)
      • Better Stack

   3. ⚡ Performance insights
      • Google PageSpeed Insights
      • Lighthouse

3. ToDo:
   2. dark mode setup
   3. adding cookies for storing language/dark mode preferences

Color scheme - https://coolors.co/tailwind/d0be6f

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## PROMPTS
Analyze the project's functionalities, implementations, SEO and detailed and highly analytic profile of how the application works and where exactly there are problems which will hinder following scaling of the website. Do not:
- provide overengineered replies, techniques, solutions, suggestions
- mention dead links, or the lack of such
- placeholder pages - those are what they are exactly, placeholder.
- focus on small details - html, css, spelling mistakes, etc.

Focus mainly on the scalability of the architecture, routing, SEO. Specify clear points of improvement to allow for clear and manageable scaling for a SEO optimized website that will contain approximately 50-60 pages that will include text, images and video. As output provide:
 - detailed .md file for the projects architecture, how it works, etc.
 - detailed .md file for a fix plan of the listed issues with scaling

## FAVICO - https://realfavicongenerator.net

## CLI COMMANDS

rm -rf .astro dist node_modules/.astro - CLEANUP BUILD FILES
npx astro sync - SYNC CONTENT FILES

