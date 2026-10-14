# Deployment Guide

This is a fully static site: upload the project folder as-is to any static host. There is no build step.

## 1. Current deployment

The site is deployed with **GitHub Pages** from the `main` branch of `aririkushimeikito/kafred` and is served at:

**https://aririkushimeikito.github.io/kafred/**

Every push to `main` triggers the "pages build and deployment" workflow automatically (visible under the repository's *Actions* tab); the site updates within a minute or two.

That URL is baked into the `<link rel="canonical">`, Open Graph / Twitter URLs and JSON-LD of all five pages, plus `sitemap.xml` and `robots.txt`.

### Moving to a custom domain

If you later attach a custom domain (recommended for search visibility), replace the URL in every file. From the project root:

```bash
# macOS / Linux — replace with your domain, no trailing slash
grep -rl "https://aririkushimeikito.github.io/kafred" --include="*.html" --include="*.xml" --include="*.txt" . \
  | xargs sed -i 's#https://aririkushimeikito.github.io/kafred#https://www.your-domain.com#g'
```

On Windows, use the "Replace in Files" feature of VS Code or Notepad++ with the same search and replacement strings. Then add the domain under *Settings → Pages → Custom domain* (GitHub creates a `CNAME` file) and point a DNS `CNAME` record at `aririkushimeikito.github.io`.

Also update the `<lastmod>` dates in `sitemap.xml` when pages change.

## 2. How clean URLs work

Each page lives at `folder/index.html`, so hosts serve:

| Request        | File served             |
|----------------|-------------------------|
| `/`            | `index.html`            |
| `/about/`      | `about/index.html`      |
| `/services/`   | `services/index.html`   |
| `/our-work/`   | `our-work/index.html`   |
| `/contact/`    | `contact/index.html`    |

No rewrite rules or JavaScript routing are involved. The `.html` files are never linked directly, and all links, canonicals and sitemap entries use the folder URLs above.

Internal links and asset paths are **relative** (`assets/css/style.css` from the home page, `../assets/css/style.css` from a sub-page). The site therefore works both at a domain root and under a sub-path such as `https://aririkushimeikito.github.io/kafred/` with no changes.

## 3. Host-specific instructions

### Netlify
1. Drag the project folder onto https://app.netlify.com/drop, or connect the Git repository.
2. Build command: *(none)*. Publish directory: `/` (the project root).
3. Netlify serves `about/index.html` for `/about/` automatically and adds the trailing slash.
4. Add your custom domain under *Domain management* and enable HTTPS.

### Cloudflare Pages
1. Create a project from the Git repository (or direct upload).
2. Framework preset: *None*. Build command: *(empty)*. Output directory: `/`.
3. Directory index files are served automatically.

### GitHub Pages (current host)
1. Pages is enabled under *Settings → Pages* with *Deploy from a branch* → `main`, folder `/ (root)`.
2. The included `.nojekyll` file stops Jekyll processing, so files are served exactly as committed.
3. Because paths are relative, the project URL `https://aririkushimeikito.github.io/kafred/` works as-is. A custom domain also works without changes other than the URL replacement in section 1.

### Vercel, Firebase Hosting, Amazon S3 + CloudFront, traditional hosting (cPanel / FTP)
Upload the files to the web root (`public_html`, `www`, the bucket root, etc.). Make sure directory index documents are set to `index.html` (S3: set *Index document* to `index.html` and, for sub-folder URLs, serve through CloudFront with a default root object or an origin-request function that appends `index.html`; most other hosts do this by default).

Apache servers serve `index.html` for folder URLs by default (`DirectoryIndex index.html`). No `.htaccess` is required.

## 4. Google Maps embed

The Contact page embeds Google Maps with an address-based URL that needs no API key:

```
https://www.google.com/maps?q=63B+A.+Mabini+St.,+Burgos,+Rodriguez+(Montalban),+Rizal,+1860,+Philippines&output=embed
```

The supplied short link (`https://maps.app.goo.gl/MZECwJ6J6NqyNUKT8`) is used for the **Get Directions** buttons and the footer, and is the fallback if the iframe does not load. If you prefer the exact pin from Google Maps, open the place in Google Maps → Share → *Embed a map* → copy the `src` of the iframe and replace the `src` attribute of the `<iframe>` in `contact/index.html`.

> The development environment used to build this site could not reach google.com, so the embed URL was not rendered in a browser there. The URL format is the standard address-query embed. Please open `/contact/` after deployment and confirm the map shows the correct location; if it does not, use the "Embed a map" code from Google Maps as described above.

## 5. Inquiry form

A static site cannot send email on its own. The form on `/contact/` therefore works in one of two honest modes, controlled by the `data-endpoint` attribute on `<form id="inquiry-form">` in `contact/index.html`:

**Default (no endpoint, `data-endpoint=""`)** — "Prepare and send" mode. After validation the form builds the message text and shows it with buttons to *Copy message*, *Open Facebook Messenger* (`https://m.me/kafred.services`) and *Call*. The visitor sends the message themselves. Nothing is ever reported as "sent".

**With a form endpoint** — set `data-endpoint` to the POST URL of a form-handling service, for example:

```html
<form id="inquiry-form" ... data-endpoint="https://formspree.io/f/your-form-id" ...>
```

The script then submits the fields (`name`, `contact`, `service`, `message`, plus a `company` honeypot) with `fetch()` and shows a success message **only** when the service responds with HTTP 2xx; otherwise it shows the phone and Messenger alternatives. Services that accept this pattern include Formspree, Basin, Getform and Web3Forms (Web3Forms also needs a hidden `access_key` input). Netlify Forms works differently: add `data-netlify="true"` and `name="inquiry"` to the form, change `method` to `post` and remove `novalidate`/the JavaScript prepare behaviour if you want Netlify to capture submissions natively.

Whichever option you choose, test a submission after deployment.

## 6. Launch checklist

- [ ] If using a custom domain, replace the GitHub Pages URL everywhere (section 1).
- [ ] Confirm `https://your-domain/sitemap.xml` and `/robots.txt` load.
- [ ] Submit the sitemap in Google Search Console; create or claim the Google Business Profile with the same name, address and phone.
- [ ] Open `/contact/` and check the map, the directions link and the form.
- [ ] Test on a phone: tap-to-call, Facebook link, menu, gallery lightbox.
- [ ] Optionally add analytics (none is included).

## 7. Updating the site later

Edit the HTML files directly and re-upload (or push to Git for Netlify / Cloudflare / GitHub Pages). Keep the header, footer and CTA blocks identical across the five pages. See `README.md` for how to add photos.
