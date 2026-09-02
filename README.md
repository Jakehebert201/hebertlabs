# Hebert Labs

Pharmacy calculation tools that show their work, plus study notes.

Built with [Astro](https://astro.build). Static output, no backend, no database.

## Running it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev      # local dev server, usually http://localhost:4321
npm run build    # static build into dist/
npm run preview  # serve the built output to check it before deploying
```

## Project layout

```
src/
  pages/
    index.astro                  home
    about.astro
    404.astro
    sitemap.xml.js               generated sitemap
    calculators/
      index.astro                calculator index
      *.astro                    one file per calculator
    notes/
      index.astro                note index
      *.md                       one file per note
  layouts/
    BaseLayout.astro             page shell, <head>, header, footer
    NoteLayout.astro             wrapper for markdown notes
  components/
    CalcPage.astro               shared calculator page structure
    Field.astro                  labeled form input
    Header.astro / Footer.astro
  scripts/
    calc.js                      shared calculator engine
  data/
    calculators.js               the calculator list
  styles/
    global.css                   all styling
public/                          copied verbatim into the build
```

## Writing a note

Drop a markdown file into `src/pages/notes/`. The filename becomes the URL, so
`beta-lactam-allergies.md` publishes at `/notes/beta-lactam-allergies/`.

Every note needs this frontmatter:

```markdown
---
layout: ../../layouts/NoteLayout.astro
title: "Title of the note"
description: "One or two sentences, shown in the index and in search results."
date: "2026-09-14"
topic: "Physical pharmacy"
---

Write the note here in normal markdown.
```

`topic` is optional. Add `draft: true` to keep a note out of the index and the
sitemap while you work on it.

## Adding a calculator

1. Copy an existing file in `src/pages/calculators/`. `specific-gravity.astro`
   is the simplest one to start from.
2. Write the form markup and the `concept` slot explaining the idea.
3. Implement `solve(values)` in the page's `<script>`. Return an object with
   `answer`, `answerLabel`, optionally `answerNote`, and a `steps` array. Throw
   a `CalcError` with a helpful message when input is missing or invalid.
4. Add an entry to `src/data/calculators.js` so it appears in the index, on the
   home page, and in the sitemap.

The shared engine in `src/scripts/calc.js` handles reading the form, rendering
the answer and steps, live-updating as the user types, error display, and the
preset example buttons.

## Deploying

`deploy_to_live.sh` runs **on the VPS**, not on your laptop. It pulls `main`,
installs dependencies (`npm ci` when `package-lock.json` is present), builds
into `dist/`, and publishes to the Nginx document root. Production is static
files only — no Node process stays running after deploy.

### VPS prerequisites

- Node.js **20 or newer** (`node --version`)
- Git clone of this repo on the server
- Nginx serving `/var/www/hebertlabs` (see `deploy/nginx-hebertlabs.conf.example`)
- Write access to the document root, or `sudo` for the publish step (see below)

First-time setup (once per server):

```bash
git clone <your-repo-url> /path/to/hebertlabs
sudo mkdir -p /var/www/hebertlabs
sudo chown "$USER:www-data" /var/www/hebertlabs   # or nginx on RHEL
# Point Nginx at /var/www/hebertlabs, then certbot if you need HTTPS
```

### Run a deploy

From the repo root on the VPS:

```bash
chmod +x deploy_to_live.sh
./deploy_to_live.sh
```

Environment overrides:

```bash
SKIP_GIT=1 ./deploy_to_live.sh              # rebuild without git pull
LIVE_DIR=/var/www/hebertlabs ./deploy_to_live.sh
USE_SUDO=1 ./deploy_to_live.sh              # publish when /var/www is not writable
sudo ./deploy_to_live.sh                    # same as USE_SUDO=1 for the publish step
NGINX_USER=www-data sudo -E ./deploy_to_live.sh   # chown after publish (implies USE_SUDO)
```

The build always runs as your user. Staging uses `$TMPDIR`, `/tmp`, or
`.deploy-stage/` in the repo — not under `/var/www/`. Copying into
`/var/www/hebertlabs` may require `sudo ./deploy_to_live.sh` or
`USE_SUDO=1 ./deploy_to_live.sh` if your user is not in the `www-data` group
with write access to the document root.

Post-deploy check:

```bash
curl -I https://hebertlabs.com/
```

The script preserves `.well-known/` in the live directory for ACME certificate
renewal and refuses to publish an empty build.

## A note on the content

Everything on the site is a study aid written by a student. It is not a
clinical reference.
