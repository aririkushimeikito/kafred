# Deployment Guide

This is a fully static site: upload the project folder as-is to any static host. There is no build step.

## 1. Production hosting: kafredlapida.com on Bluehost

The production domain is **https://kafredlapida.com**, hosted on Bluehost (shared Apache hosting). That URL is already baked into the `<link rel="canonical">`, `hreflang`, Open Graph / Twitter URLs and JSON-LD of every page, plus `sitemap.xml`, `robots.txt` and `llms.txt`.

### Upload steps (manual, first time or without GitHub)

1. In the Bluehost control panel open **File Manager** (or connect with FTP/SFTP using the credentials under *Advanced → FTP Accounts*).
2. Open the **`public_html`** folder for kafredlapida.com (if the domain is an addon domain, use its document root instead).
3. Upload the **contents** of this project (not the folder itself) so that `index.html`, `.htaccess`, `about/`, `assets/`, etc. sit directly inside `public_html`. The easiest way is to upload `Kafred-Granite-Marble-Website.zip` and use File Manager's **Extract**, then move the extracted files up one level if they land in a sub-folder.
4. Make sure hidden files are shown (File Manager → *Settings → Show Hidden Files*) and confirm **`.htaccess`** and **`.nojekyll`** were uploaded. `.htaccess` provides the HTTPS and non-www redirects, the `/folder/index.html → /folder/` redirect, the custom 404 page, compression, caching and security headers.
5. Enable the free SSL certificate: *Security → SSL/TLS* (Bluehost issues a Let's Encrypt/AutoSSL certificate automatically once DNS points at the hosting). Wait until `https://kafredlapida.com` loads with a padlock.
6. Open https://kafredlapida.com/, /about/, /services/, /our-work/, /contact/ and a wrong URL (to see the 404 page). Also check that `http://www.kafredlapida.com/about/index.html` redirects to `https://kafredlapida.com/about/`.

### Automatic deployment from GitHub (recommended)

The repository contains `.github/workflows/deploy-bluehost.yml`. Once three secrets are set, every merge to `main` uploads the site to Bluehost over FTPS, so you keep editing in GitHub (or with Claude) and the live site follows automatically. The GitHub Pages preview keeps working alongside it.

One-time setup:

1. **Create an FTP account in Bluehost.** In the Bluehost panel go to *Advanced* (cPanel) → **FTP Accounts** → *Add FTP Account*. Use a name such as `deploy`, generate a strong password, and set the **Directory** to the document root of kafredlapida.com (`public_html` when it is the primary domain). Note the server name shown under *Configure FTP Client* (usually `ftp.kafredlapida.com`).
2. **Add the secrets in GitHub.** Open the repository → *Settings* → *Secrets and variables* → *Actions* → *New repository secret* and create:
   - `FTP_SERVER` = `ftp.kafredlapida.com` (or the host shown by Bluehost)
   - `FTP_USERNAME` = `deploy@kafredlapida.com` (the full FTP user name Bluehost displays)
   - `FTP_PASSWORD` = the password you generated
   If the FTP account's directory is *not* the site root, also add a repository **variable** `FTP_SERVER_DIR` with the folder to upload into (for example `public_html/kafredlapida.com/`). Leave it unset when the FTP account already points at the document root and set `FTP_SERVER_DIR` to `./`; otherwise the default `public_html/` is used.
3. **Run the first deployment.** Go to the *Actions* tab → *Deploy to Bluehost* → *Run workflow*. The first run uploads everything (about 6 MB); later runs upload only files that changed, tracked by a small `.ftp-deploy-sync-state.json` file on the server.
4. Open https://kafredlapida.com/ and check the pages.

Notes:
- The workflow never deletes files it did not upload (`dangerous-clean-slate` is off), so anything else in `public_html` is left alone. If you remove a page from the repository, delete it on the server by hand.
- `README.md`, `DEPLOYMENT.md`, `.github`, `dist` and Git files are not uploaded; `.htaccess`, `404.html`, `llms.txt`, `sitemap.xml` and `robots.txt` are.
- Until the secrets exist, the workflow completes with a notice instead of failing.
- To stop automatic deploys, delete the secrets or disable the workflow in the Actions tab.

### Manual upload (alternative)

If you prefer not to connect GitHub to the hosting, upload the ZIP by hand as described above. Each time the site changes, download a fresh ZIP (`git archive`, see README) and re-upload.

### Canonical host

The site uses **non-www** (`https://kafredlapida.com`). If you prefer `www`, change the two redirect rules in `.htaccess` and run the URL find-and-replace in the next section with `https://www.kafredlapida.com`.

### If the domain ever changes

Replace the URL in every file. From the project root:

```bash
# macOS / Linux — replace with the new domain, no trailing slash
grep -rl "https://kafredlapida.com" --include="*.html" --include="*.xml" --include="*.txt" . \
  | xargs sed -i 's#https://kafredlapida.com#https://www.new-domain.com#g'
```

On Windows, use the "Replace in Files" feature of VS Code or Notepad++ with the same search and replacement strings. Also update the host in `.htaccess` and the `<lastmod>` dates in `sitemap.xml` when pages change.

### GitHub Pages preview

The repository also publishes a preview at `https://aririkushimeikito.github.io/kafred/` from the `main` branch. Because every page's canonical URL points to kafredlapida.com, search engines will treat the Bluehost site as the original. Once the Bluehost site is live you may disable GitHub Pages (Settings → Pages → *Unpublish site*) to avoid confusion, or keep it as a staging preview.

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

Internal links and asset paths are **relative** (`assets/css/style.css` from the home page, `../assets/css/style.css` from a sub-page). The site therefore works at the domain root on Bluehost and also under a sub-path such as the GitHub Pages preview. The only root-relative page is `404.html`, because Apache serves it for URLs at any depth.

## 3. Other hosts (if you ever move)

- **Netlify / Cloudflare Pages / Vercel:** upload the folder or connect the Git repository with no build command and `/` as the output directory. Directory index files are served automatically; `.htaccess` is ignored there, so re-create the HTTPS/www redirects and the 404 page in the host's own settings (`_redirects` on Netlify, `_redirects` on Cloudflare Pages, `vercel.json` on Vercel).
- **GitHub Pages:** push to `main` with Pages set to *Deploy from a branch → main → / (root)*. The `.nojekyll` file is included. Use a custom domain (Settings → Pages → Custom domain plus a DNS `CNAME` record) and run the URL replacement above so canonicals match.
- **Other Apache hosts (cPanel):** identical to Bluehost; upload to the document root with `.htaccess`.
- **Nginx:** directory URLs work by default with `index index.html;`. Re-create the redirects (`return 301 https://kafredlapida.com$request_uri;`), `error_page 404 /404.html;` and caching headers in the server block.

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

- [ ] Files uploaded to `public_html`, including hidden `.htaccess`; SSL active; `http://www.` redirects to `https://kafredlapida.com`.
- [ ] Confirm `https://kafredlapida.com/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/site.webmanifest` load.
- [ ] Add the site in Google Search Console (domain property) and Bing Webmaster Tools; submit `sitemap.xml`; use the Rich Results Test on each page to confirm the LocalBusiness, FAQ, Service and ImageGallery data is read.
- [ ] Create or claim the Google Business Profile with exactly the same name, address and phone number as the website, and link it to https://kafredlapida.com. Add the website link to the Facebook page's *About* section.
- [ ] Open `/contact/` and check the map, the directions link and the form.
- [ ] Test on a phone: tap-to-call, Facebook link, menu, gallery lightbox.
- [ ] Optionally add analytics (none is included).

## 7. Updating the site later

Edit the HTML files directly and re-upload (or push to Git for Netlify / Cloudflare / GitHub Pages). Keep the header, footer and CTA blocks identical across the five pages. See `README.md` for how to add photos.
