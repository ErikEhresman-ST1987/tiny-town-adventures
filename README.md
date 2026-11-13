# Tiny Town Adventures — First Playable Increment

Seven-game collection, beginning with Jungle Quest. Temporary programmatically drawn art; no final artwork approved.

## Build and deploy
GitHub Actions installs dependencies, runs tests, builds with Vite, and publishes the dist directory through GitHub Pages. In repository Settings → Pages, set the build/deployment source to **GitHub Actions**. The deployed URL is https://erikehresman-st1987.github.io/tiny-town-adventures/.

Local development: `npm install`, `npm test`, `npm run dev`. Production build: `npm run build`.

## Play
Open menu → Jungle Quest → hold to grow bridge → release to lower. Campaigns contain variable expeditions and crossings, with three shared expedition restarts. Progress is saved after each crossing or failure. JSON export/import is available in the menu.

## Known limitations
- iPad testing confirmed the original bridge mechanic; the new campaign flow and corrected GitHub Actions Pages publishing require device verification.
- Offline script is a preliminary single-release cache, **not** the fully proven Pop Squadron version-aware update integration. Multi-release A→B→C installed-PWA verification remains outstanding.
- No installed-PWA icons or approved final artwork yet.
- Six remaining games intentionally unimplemented.
- Do not clear browser data to fix updates; local progress belongs to the user.

References: approved Tiny Town Adventures Goal Box v1.1, Foundation Plan v1.0, Phaser/Vite/artwork specialist guides, Pop Squadron, Module Library.