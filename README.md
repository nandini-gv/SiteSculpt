# WebExtract MVP

WebExtract captures public webpages or selected DOM sections and exports:
- HTML/CSS/assets ZIP
- PDF
- design JSON
- React starter component
- Figma-importable design JSON (use the companion Figma plugin)

## Architecture
- `apps/web`: React + TypeScript + Tailwind dashboard
- `apps/api`: Express + Playwright capture/export API
- `apps/extension`: Chrome Manifest V3 section picker
- `figma-plugin`: Figma plugin that converts WebExtract JSON into editable native layers
- `supabase/migrations`: optional project/capture metadata schema

## Requirements
- Node.js 20+
- Chrome/Chromium installed by Playwright
- Windows 10/11, macOS or Linux

## Run locally
1. Install dependencies:
   ```bash
   npm install
   npx playwright install chromium
   ```
2. Copy `apps/api/.env.example` to `apps/api/.env` if using Supabase. Supabase is optional for local capture.
3. Start:
   ```bash
   npm run dev
   ```
4. Open the Vite URL printed in the terminal (normally http://localhost:5173). API runs on http://localhost:8787.

## Capture
- Enter a URL and choose full page or section mode.
- Full page captures use Playwright.
- For section mode, load a site in Chrome with the extension enabled, click the extension icon, then click a highlighted element. The extension sends the selected element's HTML, computed styles and screenshot to the local API.
- The app can also accept a CSS selector for an element when capturing via the API.

## Install Chrome extension
1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose "Load unpacked".
4. Select `apps/extension`.
5. Open a webpage, click the WebExtract extension icon, and click an element to capture it.
6. The extension posts to `http://localhost:8787/api/sections`.

## Figma plugin
1. In Figma desktop, open Plugins > Development > Import plugin from manifest.
2. Select `figma-plugin/manifest.json`.
3. In the plugin, paste the `design.json` exported by WebExtract.
4. Click "Create editable layers".

The plugin creates frames, text layers, rectangles and image placeholders. It does not recover a site's original Figma components or proprietary source file.

## Supabase
Supabase is optional for this local-first MVP. Apply `supabase/migrations/001_init.sql` to persist projects/capture metadata. Add the Supabase URL and anon key to `apps/web/.env` only when authentication/persistence is configured. Never expose a service-role key in the browser.

## API endpoints
- `GET /api/health`
- `POST /api/capture` `{ url, mode: "full"|"selector", selector?, viewport? }`
- `POST /api/sections` `{ url, html, text, selector, styles, screenshotDataUrl }`
- `POST /api/export/html` `{ capture }`
- `POST /api/export/pdf` `{ url, selector? }`
- `POST /api/export/react` `{ capture }`
- `POST /api/export/json` `{ capture }`

## Safety and limitations
Only capture sites you own or are authorized to inspect. Do not bypass logins, paywalls, CAPTCHAs, bot protections or access controls. The server blocks localhost/private-network targets to reduce SSRF risk. This is an MVP: complex canvas/WebGL, cross-origin frames, shadow DOM, lazy loading and interactive state replay may need site-specific handling. Asset URLs may be external and subject to copyright/licensing.
