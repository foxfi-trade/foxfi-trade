# Deploy FoxFi to Netlify (step-by-step)

This project is a **TanStack Start SSR app**, not a plain static site. Netlify needs to run the build so it creates a server function for all pages and the market-data endpoints.

## If your build failed with `npm error enoent` / exit code 254

That error means Netlify could not find `package.json` (or a usable lockfile) where it ran the build. Fix in this order:

1. **Check the repo layout.** `package.json` must be at the **top level** of the GitHub repo — not inside a `foxfi/` or `foxfi-source/` folder. If it is nested, open Netlify → **Project configuration → Build & deploy → Build settings** and set **Base directory** to that folder name; publish directory then becomes `<folder>/dist`.
2. **Remove the UI overrides.** The failing log said `commandOrigin: ui`, so Netlify used the command typed in the dashboard instead of `netlify.toml`. Clear the Build command / Publish directory fields in the UI (or set them to `bun install && bun run build` and `dist`) so `netlify.toml` is used.
3. **Match the lockfile.** This repo has `bun.lock`, not `package-lock.json`. Either keep the Bun build command from `netlify.toml`, or run `npm install` locally once and commit the generated `package-lock.json` before using `npm run build`.
4. **Confirm `public/noir.js` is committed** — check it shows on GitHub; a `.gitignore` rule can silently drop it.
5. Re-deploy with **Deploys → Trigger deploy → Clear cache and deploy site**.

## Before you deploy

1. **Put your wallet files in `public/`.**
   - `public/noir.js` — your wallet modal JavaScript (required).
   - `public/noir.css` — your wallet modal styles (optional).
   - These files are copied to the site root automatically during the build.

2. **Make sure `netlify.toml` is in the project root.** It is already included:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
  NITRO_PRESET = "netlify"
```

3. **Install dependencies locally** (so `node_modules` and lock files exist for Netlify):

```bash
npm install
```

Or if you use Bun:

```bash
bun install
```

## Deploy option A — Git import (recommended)

1. Push the project folder to a GitHub/GitLab repo.
2. Go to Netlify → **Add new site → Import an existing project**.
3. Pick the repo.
4. Netlify will read `netlify.toml`, but check these settings in the deploy UI:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variables:**
     - `NODE_VERSION` = `22`
     - `NITRO_PRESET` = `netlify`
5. Click **Deploy**.
6. Every `git push` to the default branch will redeploy automatically.

## Deploy option B — Netlify CLI

Install the CLI, then build and deploy:

```bash
npm install
npm i -g netlify-cli
npm run build          # netlify.toml already sets NITRO_PRESET=netlify
netlify deploy --prod
```

If you are testing locally first:

```bash
npm run build
netlify dev
```

## Deploy option C — drag-and-drop (not recommended)

Drag-and-drop only uploads static files. FoxFi needs a server function, so this will **not** work. Use Git import or the CLI instead.

## After the first deploy

1. Netlify gives you a site URL like `https://foxxi-abc123.netlify.app`.
2. Update these URLs in `src/routes/index.tsx` to point to your real Netlify domain:
   - `og:url`
   - `og:image`
   - `twitter:image`
   - `canonical` link
3. Push the change and Netlify will redeploy.

## What the build produces

Nitro generates:

- `dist/` — static client assets (JS, CSS, images, `noir.js`, `noir.css`).
- `.netlify/functions-internal/server` — the SSR function that handles all routes and server functions.

Do **not** deploy `dist` as a plain static folder. The Netlify function is what makes routing, server functions, and market data work.

## Wallet modal integration check

Your `noir.js` should call back into FoxFi after the user connects or disconnects:

```js
// after connect
window.foxfiSetWallet(address, chainIdHex); // e.g. "0xAbC...", "0x2105"

// after disconnect
window.foxfiClearWallet();
```

FoxFi automatically updates the header, balances, swap/positions pages, and trade page.

## Troubleshooting

- If the build on Netlify says the preset is ignored, make sure `NITRO_PRESET=netlify` is set as a site environment variable, not just in `netlify.toml`.
- If routes 404 after deploy, verify the build log shows `.netlify/functions-internal/server` was created.
- If market data is missing, check that `COINGECKO_API_KEY` is not required — the app uses public CoinGecko/DeFiLlama/Alternative.me endpoints.
