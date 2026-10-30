# NODEX update: first-time bedroom opening and sprites

Changes:
- `/` now redirects directly to `/bedroom`, removing the extra wireframe landing step.
- First-time visitors encounter the guide's player-name and character-choice screen before the controls tutorial.
- Name and character choice are stored in `nodex_player_profile` (localStorage).
- Guide dialogue greets the player by their chosen name. The existing tutorial completion flag stays intact.
- Returning players do not replay setup after finishing the tutorial.
- Replaced tiny placeholder bedroom PNGs with original pixel-art-style graphics for six furniture objects, the rug, and two characters (plus a girl variant).
- Furniture rendering now loads image assets with `Image` and `drawImage`, logging failures.
- Player and guide render from artwork files instead of CSS-gradient blocks.
- Original educational pages, input movement hook, and existing interactions are retained.

## Important limitations
- The artwork is an initial original pixel-art pass, not a polished professional tileset or a directional walking spritesheet. Floor/walls still use Canvas fillRect procedural rendering.
- The two bedroom themes currently share most of the new artwork; further themed artwork is needed.
- End-to-end browser testing and a Next.js build were not performed in this environment because the lightweight package excludes node_modules. Install dependencies and run `npm run dev` to verify.
- Back up or commit the original project first. This is a separate edited copy, not an in-place modification of your local files.
