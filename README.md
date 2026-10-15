# Kafred Granite & Marble Installation Services — Website

A hand-built static website for **Kafred Granite & Marble Installation Services**, a lapida (gravestone) engraving maker and granite and marble installer in Burgos, Rodriguez (Montalban), Rizal, Philippines.

- Semantic HTML5, modern CSS3 and vanilla JavaScript only. No frameworks, no build step, no backend; the contact form is delivered by FormSubmit.
- Five pages with clean URLs, local SEO metadata, FAQ sections, JSON-LD structured data (LocalBusiness, WebSite, WebPage/AboutPage/ContactPage/CollectionPage, Service, FAQPage, ImageGallery, BreadcrumbList), image sitemap, robots.txt and llms.txt.
- Real project photographs supplied by the company, optimised to WebP in two sizes.
- Responsive, mobile-first layout tested from 360px to 1440px, with keyboard-accessible menu, filters and lightbox.

## Pages and URLs

| Page      | Browser URL   | File                   |
|-----------|---------------|------------------------|
| Home      | `/`           | `index.html`           |
| About     | `/about/`     | `about/index.html`     |
| Services  | `/services/`  | `services/index.html`  |
| Our Work  | `/our-work/`  | `our-work/index.html`  |
| Contact   | `/contact/`   | `contact/index.html`   |

Clean URLs come from the folder structure (each page is an `index.html` inside its own directory). Apache on Bluehost serves `/about/` from `about/index.html` with no special rules; the included `.htaccess` only adds HTTPS/non-www redirects, an `index.html` → `/` redirect, caching and security headers. Internal links and asset paths are **relative** (`about/`, `../assets/...`), so the same files also work under a sub-path (the GitHub Pages preview at `https://aririkushimeikito.github.io/kafred/`).

**Production domain:** https://kafredlapida.com (Bluehost). All canonical URLs, structured data, the sitemap, robots.txt and llms.txt point there. See `DEPLOYMENT.md` for the upload steps.

## Project structure

```
.
├── index.html                 Home
├── about/index.html           About
├── services/index.html        Services
├── our-work/index.html        Our Work (gallery, filters, lightbox)
├── contact/index.html         Contact (map, inquiry form via FormSubmit)
├── assets/
│   ├── css/style.css          All styles (design tokens in :root)
│   ├── js/main.js             Navigation, filters, lightbox, form, year
│   ├── fonts/                 Self-hosted Cormorant Garamond + Inter (woff2)
│   ├── icons/                 Favicon PNGs (16–512px)
│   └── images/
│       ├── logo.png           Official logo (circular, transparent background)
│       ├── logo-320.png       Header/footer size
│       ├── favicon.png        512px favicon source
│       ├── og-image.jpg       Social-sharing image (1200×630)
│       └── projects/          Project photos, each at 800px and 1600px WebP (plus one 4:3 hero crop)
├── 404.html                   Custom not-found page (used by .htaccess ErrorDocument)
├── .htaccess                  Apache config for Bluehost (HTTPS, non-www, caching, headers)
├── favicon.ico                Multi-size ICO (16/32/48)
├── robots.txt
├── sitemap.xml                Includes image entries for every project photo
├── llms.txt                   Plain-text business summary for AI search engines
├── site.webmanifest           Web app manifest (name, icons, theme colour)
├── .nojekyll                  Keeps the GitHub Pages preview from running Jekyll
├── README.md
└── DEPLOYMENT.md
```

## Preview locally

Open the pages through a local web server (recommended) or open `index.html` directly in a browser; relative paths work either way.

```bash
# Python (built in on most systems)
python3 -m http.server 8080
# then visit http://localhost:8080/

# or Node
npx serve .
```

## Business details used on the site

| Item      | Value |
|-----------|-------|
| Name      | Kafred Granite & Marble Installation Services |
| Address   | 63B A. Mabini St., Burgos, Montalban, Rizal, Rodriguez, Philippines, 1860 |
| Phone     | +63 953 084 9511 (`tel:+639530849511`) |
| Facebook  | https://www.facebook.com/kafred.services |
| Google Maps | https://maps.app.goo.gl/MZECwJ6J6NqyNUKT8 |

No business hours, founding year, prices, reviews or certifications are published, because none were supplied. The inquiry email address appears in the contact form's FormSubmit URLs; DEPLOYMENT.md explains how to swap it for FormSubmit's alias to limit spam.

## Editing content

All content is plain HTML. The header, footer and CTA band are repeated in each of the five files, so a change to those blocks must be made in all five pages (search for the text and replace it in each file).

### Replacing or adding project photos

1. Export the photo at two widths: **800px** (grid) and **1600px** (lightbox) on the longest side, as WebP (quality ~80–85). Any image editor, Squoosh, or ImageMagick (`magick in.jpg -resize 1600x1600 -quality 84 out-1600.webp`) works.
2. Name both files descriptively, for example `lapida-black-granite-gold-lettering-800.webp` and `...-1600.webp`, and place them in `assets/images/projects/`. Pages inside sub-folders reference them as `../assets/images/projects/...`; the home page as `assets/images/projects/...`.
3. Copy an existing `<figure class="work-item">` block in `our-work/index.html` and update:
   - `href` (1600px file) and `data-width` / `data-height` (its pixel size),
   - `src`, `srcset`, `width`, `height` (800px file and its pixel size),
   - `alt` (describe what is visible; avoid personal names),
   - `data-caption` and `<figcaption>`,
   - `data-category` (space-separated: `granite`, `marble`, `gold`, `etched`, `portrait`, `installed`, `pet`).
4. Featured photos on the home page use the same markup in `index.html`.

### Changing the hero slideshow

The home hero is a crossfade slideshow of seven `<figure class="hero-slide">` blocks in `index.html`, each pointing at a photo in `assets/images/projects/` (800px and 1600px versions). To swap a photo, change the `src`, `srcset`, `width`, `height`, `alt` and `data-caption` of one slide. To add or remove slides, add or remove a `<figure>` and the matching `<button class="hero-slides__dot">`, and update the "Photo n of 7" labels. The first slide is intentionally **not** lazy-loaded and is preloaded in the `<head>` (`<link rel="preload" as="image" ...>`); keep that line in sync if you change the first photo. The interval is set by `data-interval` (milliseconds) on the slideshow element. Auto-advance pauses on hover, focus and the pause button, and is disabled for visitors who prefer reduced motion.

### Logo and favicon

`assets/images/logo.png` is the supplied logo cropped to its circular badge with a transparent background. The favicons in `assets/icons/` and `favicon.ico` are generated from it. If the logo changes, regenerate these files at the same sizes.

### Colours and type

Design tokens are at the top of `assets/css/style.css`:

```
--black: #0B0B0B   --black-2: #151515   --white: #FFFFFF   --soft-white: #F7F7F5
--gold: #C5A253    --gold-dark: #A98535 --gray: #A7A7A7    --text-dark: #222222
```

Gold text is only used on dark backgrounds; on the light sections the darker gold (`--gold-dark`) is used for contrast.

## SEO, GEO and AEO checklist (what is built in)

- One H1 per page; H2 for every section and H3 for sub-items, with no skipped levels. Footer headings are plain paragraphs so they do not dilute the outline.
- Unique titles (under 60 characters) and descriptions (about 150 characters) with the service and location, canonical and `hreflang` links, Open Graph and Twitter tags with image alt text, `robots` directives allowing large image previews, `geo.region` / `geo.placename`, theme colour and a web manifest.
- Every image has descriptive `alt` text and a `title`; every link has a descriptive `title`; captions name materials and techniques only (never the people on the stones).
- Visible FAQ sections on Home and Services, marked up as `FAQPage`, with concise first-sentence answers for answer engines.
- JSON-LD `@graph` on every page: `LocalBusiness` (address, phone, map, Facebook, service area, offer catalogue, `knowsAbout`), `WebSite`, a typed `WebPage` with `speakable` selectors, `BreadcrumbList`, plus `Service` nodes (Services), `ImageGallery` with `ImageObject`s (Our Work).
- `sitemap.xml` with image entries, `robots.txt`, and `llms.txt` summarising the business for AI assistants.
- Only verified facts are published: no hours, email, prices, reviews, founding year or certifications.

## Interactive features (assets/js/main.js)

- Mobile navigation with `aria-expanded`, Escape-to-close and focus management.
- Sticky header shadow on scroll.
- Hero slideshow (seven project photos, crossfade, prev/next, dots, pause, swipe, keyboard; auto-advance off under `prefers-reduced-motion`).
- Home-page ticker (pure CSS animation, paused on hover, disabled under `prefers-reduced-motion`).
- Gallery filters (Our Work) with live status text.
- Lightbox with previous/next, arrow keys, Escape, swipe and focus trapping.
- Inquiry form: validated client-side and delivered by FormSubmit to the shop's email (subject "KAFRED LAPIDA INQUIRY"); shows the phone and Messenger links if delivery fails (see `DEPLOYMENT.md`).
- Subtle reveal-on-scroll (disabled under reduced motion).
- Dynamic copyright year.

Everything degrades gracefully with JavaScript disabled: links, phone numbers, images and the form's native fallback still work.

## Packaging

To rebuild the delivery ZIP from the repository:

```bash
git archive --format=zip --prefix=Kafred-Granite-Marble-Website/ -o Kafred-Granite-Marble-Website.zip main
```

## External dependencies

None at runtime, apart from the Google Maps `<iframe>` on the Contact page and the FormSubmit service that delivers the inquiry form. Fonts are self-hosted. No analytics or third-party scripts are included.
