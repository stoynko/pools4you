# PROJECT_UI_UX_KNOWLEDGE.md
# Pools4You — UI/UX Design System & Implementation Guide

> **Purpose of this file:** This is the single source of truth for all UI/UX decisions on the Pools4You website. Attach this file to any AI-assisted session so the agent understands the design direction without re-analysis. Update this file whenever major design decisions are made.

---

## 1. Project Summary

**Pools4You** (Pools 4 You Ltd.) is a Bulgarian-based company that designs, builds, and maintains luxury swimming pools and wellness aquatic environments. Their clients span private villa owners, hotels (Hilton, Barceló), resorts, public facilities, and commercial developments.

The website is a **bilingual (BG/EN) static marketing site** built with Astro SSG + Tailwind CSS v4. It is not a web app, not a SaaS, not an e-commerce store, and not a CMS. It exists to:

- Establish credibility and premium brand positioning
- Showcase past projects (portfolio)
- Communicate services offered
- Drive contact/inquiry conversions

The live deployment is at: **https://pools4you.vercel.app**

---

## 2. Design Goal

The website must communicate one thing above all else: **this is a company you can trust with a high-value, long-duration construction investment.**

**Intended feeling when landing on the site:**
- Calm confidence — not flashy, not loud
- Premium craftsmanship — like a luxury architecture firm or high-end interior studio
- Reliable and professional — not trendy startup aesthetics
- Elegant restraint — quality expressed through what is *not* there as much as what is

**Visual references that align with the brand direction:**
- High-end architecture studio portfolios
- Luxury hospitality brands (not loud luxury — quiet luxury)
- Premium real estate development firms
- High-end European construction/engineering firms

**What it should NOT feel like:**
- A SaaS dashboard
- A tech startup
- A consumer app
- An agency portfolio with heavy animations everywhere
- A loud or flashy construction company

---

## 3. Current State

As of the time this file was created, the website's UI is intentionally minimal and prototype-level. The development priority was on:

- Bilingual routing architecture (BG default, EN under `/en/`)
- Astro Content Collections for project markdown files
- SEO architecture (canonical, hreflang, OG, JSON-LD)
- Dynamic project detail pages
- Page registry and navigation system
- Build output validation

The current UI has almost no visual styling. Components exist but are unstyled or minimally styled. The architecture is solid. Now the work is purely visual.

**Do not touch the routing, content, SEO, or architecture unless a styling change specifically requires a local component adjustment.**

---

## 4. Visual References

### `home-overview`
Illustrates a dark-background reference design (likely Figma mockup) with:
- Full-width hero section with pool image + process pillars (Experience / Efficiency / Value)
- "Curated Disciplines" section with image cards (Private Estate, Commercial, Wellness, Restoration)
- "Featured Projects" section with alternating image/text project rows
- "Ready to dive in?" CTA block with two buttons (primary filled + secondary ghost)
- Multi-column footer with sitemap, contact, and settings columns

→ **Use this as the content structure and section-ordering reference for the home page.**

### `contacts-overview`
Shows:
- Full-width teal-toned hero banner with contact headline + contact info card (email, phone, location, hours) floated right
- Three-column intent selector: SERVICE / START A NEW PROJECT / GENERAL ENQUIRIES — each with icon, description, and CTA button
- Accordion-style FAQ section with gold chevron indicators
- Same footer as rest of site

→ **Use this for the contact page layout and the FAQ accordion pattern.**

### `project-details-overview`
Shows:
- Full-width hero image with title overlaid at bottom-left
- Horizontal thumbnail strip (gallery preview)
- Breadcrumb navigation below thumbnails
- Two-column body: left = client logo + project meta (location, dates, area), right = project description text
- "Related Projects" section with 4 horizontal project cards
- Standard footer

→ **Use this for the project detail page layout and related projects component.**

### Actual Live UI (current state)
The current live site at `/proekti` shows a dark theme with gold accents as the **actual implemented design direction** — dark navy backgrounds, gold headings, and a header with globe/moon/phone icons. This is the dark mode variant and is the current base. The **default mode should be light**, with dark mode as a secondary toggle.

---

## 5. Brand Rules

### Gold Accent Usage
- Gold (`#CEB476`) is the **primary brand accent only**. It is not a background color, not a text color for body copy, and not used decoratively everywhere.
- Gold is used for: logo, section eyebrow labels, heading accents in dark sections, primary CTA buttons (filled), active nav states, icon accents, divider lines under section titles, accordion chevrons, and key metric/stat callouts.
- In light mode, gold appears on white/light backgrounds as the accent pop.
- In dark mode, gold is more prominently used since the dark backgrounds support it naturally.
- **Do not overuse gold.** Every gold element should feel intentional. If everything is gold, nothing is.

### Premium Feel
- Use generous whitespace. Sections should breathe.
- Typography hierarchy must be clear: large editorial headings, small refined body text.
- Image quality is critical — only show full-bleed, well-composed photos. Never thumbnail-sized images in hero areas.
- No rounded corners on images (or very subtle — 4px max). Pools4You builds precise structures; sharp geometry supports the brand.
- Subtle borders only. Never thick decorative borders.
- No drop shadows on cards unless extremely subtle (`box-shadow: 0 1px 4px rgba(0,0,0,0.06)`).

### Restrained Styling
- Section backgrounds alternate between pure white (`#FFFFFF`), off-white (`#F9F9F9`), and warm (`#ECE7DC`) — never more than two alternating backgrounds per page.
- Do not use gradients on backgrounds unless it's a subtle image overlay (hero sections).
- Do not use CSS glows, neon effects, or heavy drop shadows.
- Decorative elements should be minimal: a thin gold divider line, a small eyebrow label in uppercase tracking, a subtle background texture (light grain optional).

### Spacing
- Section vertical padding: `py-20` to `py-28` (80–112px) on desktop.
- Component inner padding: `p-6` to `p-8` on cards.
- Heading-to-body gap: `mt-4` to `mt-6`.
- Never compress sections to save space. If content is sparse, the space is a feature.
- Max container width: `1280px`, centered.

### Image Usage
- Hero images: full-width, 60–70vh tall minimum, no borders.
- Project cards: landscape-oriented images, consistent aspect ratio (16:9 or 3:2).
- Gallery: horizontal strip or grid. Do not crop carelessly.
- Never use stock-photo-style images. Only real project photography.
- Subtle image overlay (`rgba(0,0,0,0.2–0.4)`) on hero images only when text is overlaid.

### Card Styling
- Light mode: white background, very subtle border (`1px solid #E5E7EB`), minimal shadow.
- Dark mode: `#15171C` (elevated) background, `1px solid rgba(255,255,255,0.06)` border.
- No border-radius above `8px`.
- Hover: subtle upward translate (`translateY(-3px)`) + slightly deeper shadow.

### Button Styling
- **Primary (Gold filled):** Background `#CEB476`, text `#0D0E11`, no border, `font-weight: 500`, uppercase tracking or normal casing both acceptable, height ~48px, horizontal padding ~28px.
- **Secondary (Ghost):** Transparent background, `1px solid currentColor` or `1px solid #CEB476`, text `#CEB476` in dark, text `#1a1a1a` in light. Same sizing as primary.
- **Hover on primary:** Background `#A8925F` (Gold Muted) — darken, don't lighten.
- **Hover on ghost:** Fill with gold at low opacity (`rgba(206,180,118,0.1)`).
- Avoid pill-shaped buttons. Slight rounding is fine (`border-radius: 4px`), or square.

---

## 6. Typography Rules

### Final Font Recommendation

| Use Case | Font | Weight | Notes |
|---|---|---|---|
| Section headings (H1, H2) | **Libertinus Serif** | 400 (Regular) | Italic variant for editorial feel |
| Sub-headings (H3, H4) | **Libertinus Serif** | 400 | Slightly smaller, same character |
| Eyebrow labels | **Inter** | 500 | Uppercase, letter-spacing 0.12em |
| Body copy | **Inter** | 400 | Line-height 1.7, max 65ch width |
| Navigation links | **Inter** | 400–500 | Normal case, no uppercase |
| Buttons | **Inter** | 500 | Normal or uppercase at discretion |
| Captions / meta | **Inter** | 400 | Small size (~13px), muted color |
| Project titles | **Libertinus Serif** | 400 (Italic) | Editorial quality |
| Stats / metrics | **Libertinus Serif** | 400 | Large numerals have good character |
| Footer | **Inter** | 400 | Small, subdued |

**Rationale:**
- Libertinus Serif brings the editorial, high-end character that differentiates the brand from generic construction companies. It has excellent Cyrillic support which is critical for BG language.
- Inter handles all UI text — navigation, body, labels — with functional clarity.
- The combination of a serif display font with a clean sans-serif body is a well-proven luxury branding pattern.
- Do NOT use Libertinus for body copy — it slows reading and reduces legibility at paragraph sizes.

### Type Scale (Desktop)
```
Display / H1: 56–72px, Libertinus, line-height 1.1
H2 (section heading): 40–48px, Libertinus, line-height 1.15
H3 (sub-section): 24–28px, Libertinus, line-height 1.25
H4 / card title: 18–20px, Libertinus
Body: 16–17px, Inter, line-height 1.7
Small / meta: 13–14px, Inter
Eyebrow: 11–12px, Inter, uppercase, tracking 0.12em
```

---

## 7. Final Color System

### CSS Custom Properties (use in `global.css`)

```css
:root {
  /* === GOLD ACCENT === */
  --color-gold: #ceb476; /* PRIMARY ACCENT */
  --color-gold-hover: #a8925f; /* PRIMARY ACCENT ALT - BUTTON HOVERS */
  --color-gold-subtle: #d9c48a; /* DECORATIVE GOLD TINTS */

  /* === LIGHT MODE SURFACES === */
  --color-bg: #ffffff; /* MAIN PAGE BACKGROUND */
  --color-bg-secondary: #f9f9f9; /* SECTION BACKGROUND */
  --color-bg-warm: #ece7dc; /* CTA SECTIONS, ACCENT BLOCKS - BACKGROUND */
  --color-surface: #ffffff; /* CARDS, MODALS */

  /* === LIGHT MODE TEXT === */
  --color-text: #111111; /* MAIN BODY TEXT */
  --color-text-secondary: #6b7280; /* CAPTIONS, META, SECONDARY LABELS*/
  --color-text-muted: #9ca3af; /* PLACEHOLDER, DISABLED */

  /* === LIGHT MODE BORDERS === */
  --color-border: #e5e7eb; /* DIVIDERS, CARD BORDERS*/
  --color-border-alt: #f2f3f5; /* DIVIDERS, SEPARATORS ALT */

  /* === DARK MODE SURFACES === */
  --color-dark-bg: #0d0e11; /* MAIN PAGE BACKGROUND */
  --color-dark-surface: #15171c; /* CARDS, ACCENT ELEMENTS */
  --color-dark-surface-alt: #1b1e24; /* HOVER STATES, MODALS */

  /* === DARK MODE TEXT === */
  --color-dark-text: #f9f9f9;
  --color-dark-text-secondary: #9ca3af;

  /* === DARK MODE BORDERS === */
  --color-dark-border: rgba(255, 255, 255, 0.08);

  /* DARK MODE OVERRIDES */
  [data-theme="dark"] {
    --color-bg: #0d0e11;
    --color-bg-secondary: #15171c;
    --color-bg-warm: #1b1e24;
    --color-surface: #15171c;
    --color-text: #f9f9f9;
    --color-text-secondary: #9ca3af;
    --color-text-muted: #6b7280;
    --color-border: rgba(255, 255, 255, 0.08);
    --color-border-subtle: rgba(255, 255, 255, 0.04);
  }
```

### Colors Removed From Original Palette

| Original Color | Verdict | Reason |
|---|---|---|
| `--white-aqua: #E6F0F3` | **Removed** | Too blue/cold for a warm premium brand. Not needed. |
| `--light-background: #F2F3F5` | **Absorbed** | Replaced by `--color-border-subtle` for rare use only |
| `--gray: #D8D6CE` | **Removed** | Close to `--color-border`. Redundant. |
| `--dark-muted: #1B1E24` | **Kept as** `--color-dark-surface-alt` | Useful for hover states in dark mode |
| `--gold-accent: #D9C48A` | **Kept as** `--color-gold-subtle` | Decorative only, use sparingly |
| `--logo-gold: #c7a451` | **Merged into** `--color-gold` | Not meaningfully different from `#CEB476` |

---

## 8. Light Mode Rules

Light mode is the **default**. The site loads in light mode unless the user has toggled dark mode.

- **Page background:** `--color-bg` (`#FFFFFF`) — clean, minimal
- **Alternating sections:** `--color-bg-secondary` (`#F9F9F9`) — barely perceptible alternation
- **Warm/CTA sections:** `--color-bg-warm` (`#ECE7DC`) — used for the "Ready to dive in?" section and similar premium CTA blocks only. Not overused.
- **Cards:** `--color-surface` (`#FFFFFF`) with `1px solid --color-border`
- **Primary text:** `--color-text` (`#111111`) — near-black, not pure black
- **Secondary text:** `--color-text-secondary` (`#6B7280`)
- **Gold accent** appears on: buttons, hover states, active nav links, section eyebrow labels, icon accents
- **Hero sections** in light mode: full-bleed photography with dark overlay. Text is white over the image.
- **Headings in body sections:** `--color-text` (`#111111`) — not gold unless on a warm/dark background section
- **Borders:** `1px solid --color-border` (`#E5E7EB`)

---

## 9. Dark Mode Rules

Dark mode is toggled by the moon icon in the header. Applied via `data-theme="dark"` on `<html>`.

- **Do not design dark mode separately.** It should be a CSS variable override — the same components, the same structure, just different variable values.
- **Dark background stack:** `#0D0E11` → `#15171C` → `#1B1E24` (base → elevated → hover)
- **Gold is more prominent in dark mode** — it reads much better against dark backgrounds. This is fine.
- **Section alternation in dark mode:** alternate between `#0D0E11` and `#15171C` only. The difference should be subtle.
- **Text:** `#F9F9F9` primary, `#9CA3AF` secondary
- **Borders:** `rgba(255,255,255,0.08)` — always semi-transparent white, never a solid dark-on-dark color
- **Primary CTA button:** same gold background in both modes
- **Ghost button in dark mode:** gold border + gold text

The actual live site at `/proekti` already implements a close approximation of dark mode, which is the right direction.

---

## 10. Animation Rules

### Appropriate Animations

All animations should feel like a **premium publication loading** — measured, intentional, confident.

| Animation | Use Case | Parameters |
|---|---|---|
| **Fade-in + slide-up** | Section content entering viewport | `translateY(20px) → 0`, `opacity 0 → 1`, `duration: 0.6s`, `ease: cubic-bezier(0.16, 1, 0.3, 1)` |
| **Staggered children** | Feature lists, card grids | 80–120ms delay between items |
| **Image reveal** | Hero images, project images | Clip-path or opacity fade, `duration: 0.8s` |
| **Accordion** | FAQ open/close | `max-height` transition or `grid-template-rows`, `duration: 0.3s ease` |
| **Card hover** | Project cards, discipline cards | `translateY(-4px)`, `duration: 0.25s ease`, subtle shadow deepening |
| **Nav link hover** | Header links | Underline slide-in from left, `duration: 0.2s` |
| **Button hover** | All buttons | Background color transition, `duration: 0.2s` |
| **Page entrance** | First load | Single fade-in of main content, `duration: 0.4s` |

### Implementation Approach

Use **Intersection Observer** for scroll-triggered animations. A simple vanilla JS utility is sufficient — no need for GSAP or ScrollTrigger unless a specific hero sequence requires it.

```js
// Minimal scroll animation utility
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('is-visible');
      observer.unobserve(el.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```

Apply `.is-visible` class transitions in CSS using `data-animate` attributes.

### What to Avoid

- **No parallax on every section** — a single hero parallax at most
- **No slow animations above 0.8s** (except hero reveals)
- **No motion that affects layout** — no width/height animations that cause reflow
- **No hover animations that move text** in ways that change reading flow
- **No loading spinners** or skeleton screens (SSG, not needed)
- **No scroll-jacking**
- **No bouncing/elastic easings** on serious/professional content — save spring easing for subtle micro-interactions only
- **No auto-playing carousels** — user-controlled only

---

## 11. Page-Level Guidance

### Home Page
- **Hero:** Full-viewport height, pool photography as background (dark overlay), left-aligned white headline + short descriptor, no CTA button in hero (the page itself is the CTA journey). Optionally: 3 process pillars (Experience / Efficiency / Value) in the lower right of the hero.
- **Disciplines/Services section:** White background, large editorial heading, 4-column image grid with overlay labels.
- **Featured Projects:** Alternating rows (image left / text right, then text left / image right). Use large images (55–60% of row width). Keep to 2–3 featured projects max.
- **CTA block:** Warm background (`#ECE7DC`), centered content, gold primary button + ghost secondary. Minimal and clean.
- **Footer:** Dark background (matches design mock). Multi-column. Gold logo, white text links.

### Projects Listing Page (`/proekti`, `/en/projects`)
- Grid of project cards, 3 columns desktop / 2 tablet / 1 mobile.
- Card: full-width image (3:2 ratio), project title below, location meta, subtle hover state.
- Filtering by category (if future-added) should use a tab-style selector above the grid, not a sidebar.
- Minimal hero at top — just a section title + short intro. No large background image needed.

### Project Detail Page
- Full-width hero image (60–70vh). Title overlaid at bottom-left with semi-transparent scrim.
- Thumbnail gallery strip below hero.
- Breadcrumb navigation.
- Two-column layout: left = client logo + project meta sidebar, right = full project description.
- "Related Projects" row — 4 cards horizontally.
- No sidebar ads, no social share buttons, no comment sections.

### Contacts Page
- Hero banner with dark overlay on water/pool image. Left: headline + descriptor. Right: contact info card (semi-transparent dark card with email, phone, location, hours).
- Intent block: 3 columns (SERVICE / START A PROJECT / GENERAL ENQUIRIES). Each has icon, label, short text, CTA button.
- FAQ accordion section.
- No inline contact form shown in reference design — confirm with client whether a form is needed.

### FAQ Accordion
- Contained width (~800px centered max).
- Each item: gold-bordered pill/row, question in Inter 15px medium, gold chevron right-aligned.
- Open state: chevron rotates 180°, answer text fades/slides in below.
- Only one item open at a time (optional but cleaner).

### Header
- Transparent on hero sections (scrolled: becomes solid with slight blur backdrop).
- Logo left, single nav item center (or sparse — current design shows only "About Us"), icon cluster right (globe/language, dark mode toggle, phone CTA).
- No hamburger menu exists yet — mobile nav is a future task.
- Sticky on scroll.

### Footer
- Always dark background regardless of page theme.
- Logo top-left, thin gold horizontal rule.
- 5 columns: Services / Solutions / Projects / Company / Resources.
- Social icons centered with decorative dashes.
- Copyright line.
- "Powered by SeaSolutions" attribution.

### Language Switcher
- Globe icon in header. On click: toggle BG/EN using the defined bilingual URL structure.
- No language dropdown — just a direct toggle between BG and EN.
- Active language: highlighted with gold or slightly bolder weight.

### Mobile Layout
- Stack all multi-column layouts to single column.
- Navigation: hamburger menu (not yet implemented — do this after core styling).
- Hero text: smaller type, still left-aligned.
- Project cards: 1 column.
- Contact intent block: stacked cards.
- Footer: 2 columns then single column below ~480px.

---

## 12. Component-Level Guidance

### Hero Sections
- Background: full-bleed photography
- Overlay: `rgba(0,0,0,0.3)` to `rgba(0,0,0,0.5)` depending on image brightness
- Text: white, left-aligned, max-width ~640px
- Eyebrow label (optional): small caps, gold, spacing above heading
- No CTA button needed in hero on most pages — the page scroll is the CTA

### Cards (General)
- White background in light mode
- `border: 1px solid var(--color-border)`
- `border-radius: 6px`
- No heavy shadow — `box-shadow: 0 1px 3px rgba(0,0,0,0.06)` max
- Hover: `translateY(-3px)` + slightly deeper shadow

### Project Cards
- Image fills top of card (3:2 aspect ratio, `object-fit: cover`)
- Below image: project name (Libertinus Serif, ~18px), location (Inter small, muted), optional category tag
- Full card is clickable — no separate "View Project" button needed
- In listing view: cards should feel like a magazine editorial grid

### Buttons
- See Brand Rules → Button Styling above
- Always use `<button>` or `<a>` with consistent sizing
- Two variants only: Primary (gold filled) + Ghost
- Avoid tertiary button variants — use text links instead

### Accordions
- Max width: 820px, centered
- Border: `1px solid var(--color-border)` on each row
- In dark mode: `1px solid var(--color-dark-border)` with gold tint on open state
- Question: Inter 15px, `font-weight: 500`
- Answer: Inter 15px, `font-weight: 400`, line-height 1.7, `color: var(--color-text-secondary)`
- Gold chevron (`›` rotated or SVG) right-aligned
- Animation: `max-height` transition or `grid-template-rows: 0fr → 1fr`

### Image Galleries
- Thumbnail strip: horizontal scroll on mobile, fixed grid on desktop
- Active thumbnail: gold border indicator
- Main image: full-width lightbox or static display
- No autoplay, no zoom-on-hover unless very subtle

### Feature Sections
- Alternating layout (image + text) — see home-overview Featured Projects
- Column ratio: ~55% image / 45% text
- Text column: eyebrow label (gold, small caps) → H2 heading → body paragraph → optional CTA
- Image: no border, no radius on large images

### CTA Sections
- Centered content on warm (`#ECE7DC`) or dark (`#0D0E11`) background
- Gold icon above heading (the water-drop logo icon works well here)
- H2 heading (Libertinus)
- Short supporting line (Inter)
- Two buttons side by side (primary + ghost)
- Section padding: generous (py-24 minimum)

### Forms / Contact Blocks
- Labels above inputs (not floating labels)
- Input style: `border-bottom: 1px solid var(--color-border)` underline style for premium feel, OR full-border `1px solid var(--color-border)` with `border-radius: 4px`
- Focus state: gold border (`--color-gold`)
- Submit button: primary gold button
- No multi-step forms unless the inquiry flow specifically requires it

---

## 13. Implementation Notes

### Technology Constraints
- **Astro SSG** — no runtime JS from the framework. All interactivity is vanilla JS in `<script>` tags.
- **Tailwind CSS v4** — utility-first, but use CSS custom properties for design tokens (colors, fonts) so dark mode and theming work cleanly alongside Tailwind.
- **No additional CSS frameworks.** No Bootstrap, no Chakra UI, no Headless UI.
- **No heavy animation libraries** unless a specific sequence justifiably needs it. Vanilla IntersectionObserver + CSS transitions cover 95% of animation needs.

### Dark Mode Implementation
Apply `data-theme="dark"` to `<html>`. Toggle via JS with `localStorage` persistence. The CSS variable override approach means Tailwind classes still work — just the variable values change.

```js
// In MainLayout.astro <script>
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'dark' || (!stored && prefersDark)) {
  document.documentElement.setAttribute('data-theme', 'dark');
}
```

### Global CSS Structure
Keep `global.css` clean:
1. CSS custom property definitions (`:root` + `[data-theme="dark"]`)
2. Base resets (minimal)
3. Typography base styles (body, headings defaults)
4. Reusable utility classes (`.container`, `.section`, `.eyebrow`, `.btn`, `.btn-ghost`)
5. Animation keyframes + transition helpers

### Tailwind + CSS Variables
Use Tailwind for layout, spacing, and responsive utilities. Use CSS variables (via `var()`) for colors so dark mode works without Tailwind dark class duplication.

```html
<!-- Good: uses CSS variable so dark mode works automatically -->
<div style="background: var(--color-bg)">

<!-- Also good: Tailwind spacing + custom color -->
<section class="py-20 px-4" style="background: var(--color-bg-secondary)">
```

### Component Architecture
- Keep templates lean. `MainLayout.astro` handles head, header, footer.
- Each page template (`IndexPage.astro`, etc.) composes sections.
- Build a `Section.astro` wrapper component for consistent section padding.
- Build a `Button.astro` component early — it will be used everywhere.
- Build a `ProjectCard.astro` component before building the projects grid.

---

## 14. Non-Goals

The following are explicitly out of scope for this project:

- **Do not add a CMS** (Sanity, Contentful, Strapi, etc.). Astro Content Collections with Markdown is sufficient.
- **Do not redesign the routing or URL architecture.** It is correct and SEO-complete.
- **Do not introduce React, Vue, or Svelte** just for UI components. Astro components + vanilla JS are sufficient.
- **Do not add Redux, Zustand, Pinia, or any state management library.**
- **Do not add heavy animation libraries** (GSAP, Framer Motion, Lottie) unless a specific sequence cannot be done with CSS + vanilla JS.
- **Do not build an enterprise design token system** with hundreds of variables. The 15-variable CSS token set above is the target.
- **Do not add a blog** until the core pages (home, services, projects, contact) are fully styled and content-complete.
- **Do not add authentication** of any kind.
- **Do not add e-commerce or pricing calculators** at this stage.
- **Do not change the bilingual architecture** — the BG/EN routing is intentional and SEO-complete.
- **Do not add dark mode as a separate design system** — it must be a pure CSS variable override, not a separate stylesheet.

---

## Appendix: Key File Locations

| Purpose | Path |
|---|---|
| Global styles | `src/styles/global.css` |
| Main layout | `src/layouts/MainLayout.astro` |
| Head + SEO | `src/layouts/MainHead.astro` |
| Header component | `src/components/layout/Header.astro` |
| Footer component | `src/components/layout/Footer.astro` |
| Home page template | `src/templates/IndexPage.astro` |
| Projects listing | `src/templates/ProjectsPage.astro` |
| Project detail | `src/templates/projects/ProjectPage.astro` |
| Translation strings | `src/lib/i18n/{bg,en}/` |
| Project content | `src/content/projects/{folder}/bg.md + en.md` |
| Color tokens | Define in `src/styles/global.css` `:root` block |

---

*Last updated: April 2026. Update this file whenever significant design decisions are made.*
