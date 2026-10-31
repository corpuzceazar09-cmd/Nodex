# NODEX angled bedroom redesign

This revision replaces the old 512x384 rectangle map with an original, FireRed-era inspired 1536x1024 angled-bedroom art scene. It remains part of the existing Next.js app.

## What changed
- `components/bedroom/BedroomScene.jsx` renders the redesigned room and responsive stage, with player, NPC, prompt, bed blanket, and interactive highlights as independent overlays.
- `data/isoBedroomObjects.js` defines the new pixel-aligned object rectangles and silhouettes.
- `utils/bedroomGeometry.js` handles boundaries and foot-based furniture collisions.
- `components/bedroom/PlayerCharacter.jsx` and `TutorialNPC.jsx` now render 4-direction × 3-frame original pixel-art sprite sheets, enlarged relative to the original tiny characters.
- Bed rest displays the player's head on the pillow and a separate blanket foreground. Wake-up restores the previous safe position.
- `components/bedroom/MobileControls.jsx` supports held touch input and is hidden for fine-pointer desktop devices.
- `hooks/usePlayerMovement.js` accepts a speed parameter and maintains a stable collision callback.
- `hooks/useInteraction.js` supports scene-specific hotspots.

## Important limitation
The detailed room furniture is currently **part of the original illustrated background**, with independent hitboxes and SVG highlights. Bed blanket and character sprites are separate. This preserves gameplay, but full furniture-by-furniture depth sorting is not implemented. A future pass could separate the furniture images fully.

## Testing
- Run `npm run check:bedroom` to check spawn, furniture boundaries, and bed/computer proximity.
- Run `npm run dev` and test the tutorial, bed rest/wake, all furniture, and computer launch in your local browser.
- Core JSX syntax was checked offline; a full Next.js build was not possible in the assistant environment because the SWC native package wasn't present and package downloads were unavailable.

## Controls
- WASD or arrow keys: hold to move
- E, Enter or Space: interact
- E, Enter, Space or Escape: wake from bed
- Touch D-pad and E are shown on touch devices

The NPC intro still automatically begins when the bedroom page loads, following the user's accepted flow.
