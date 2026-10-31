# NODEX bug-fix pass (bedroom + sandbox)

## Bedroom
| Issue | Fix | Files |
|---|---|---|
| Background not blurred during intro | Room blurs/dims while the guide talks; clears when the guide leaves | `components/bedroom/BedroomScene.jsx` |
| Prof should be at the side | Character-select style intro: the professor stands full-body on the RIGHT (facing the player); in-room guide moved off the rug to the side (between bookshelf and TV) | `DialogueBox.jsx`, `data/isoBedroomObjects.js` (`GUIDE_POSITION`) |
| Gender choice was plain text buttons | Boy and girl stand full-body on the LEFT. Click one (or ◀ ▶) to highlight it; the other dims. Confirm with "Choose BOY/GIRL". Your chosen character stays on the left for the rest of the intro | `DialogueBox.jsx` |
| Skip/Show text bug | Typewriter interval was never cleared on skip, so text kept re-typing. Now one interval per line, cleared on skip; 180 ms click cooldown stops spam-click skipping unseen lines | `DialogueBox.jsx` |
| Invisible barrier | Removed bogus collider on the lower edge of the rug; walkable floor now follows the real floor edges (gaps between desk/drawer/bookshelf, doorway) | `data/isoBedroomObjects.js` |
| Bookshelf text unreadable | New book reader: 17–18 px text, paged content, prev/next, Esc to close | `BookshelfMenu.jsx`, `data/bookshelfContent.js` |
| Drawer contents | Top drawer = circuit kit (breadboard, ICs, DIP switch, LEDs, resistors, jumpers, 5V supply). Bottom drawer = RJ45 kit (UTP cable, RJ45 plugs, stripper, crimper, tester, T568A/B chart) | `DrawerInteraction.jsx`, `data/drawerContent.js` |
| Dashed inner border on objects | Removed; the prompt bubble shows what you can use | `BedroomScene.jsx` |
| Interaction too far away | Collision boxes are now the furniture floor footprints, and you must stand within 34 px of one to interact | `data/isoBedroomObjects.js`, `utils/bedroomGeometry.js`, `hooks/useInteraction.js` |
| Male character movement scuffed | Re-aligned every sprite frame to a common foot line, removed white halo/speckles, replaced the cut-off walk-up frames; walk cycle is now step-stand-step-stand with pixel snapping | `public/assets/bedroom/*/characters/*-sheet.png`, `PlayerCharacter.jsx` |

## Sandbox
| Issue | Fix | Files |
|---|---|---|
| Demo wrong / DIP switch wrong | Demo is now a real breadboard circuit: 5V → DIP switch → 7408 inputs, output → LED, VCC/GND wired with red/black jumpers. Slide DIP switch 2 up to light the LED. DIP switch redrawn as a real part (red body, two sliders, "ON ▲" marking, slider up = ON); click a slider to toggle | `SandboxClient.tsx`, `DipSwitchOnBoard.tsx` |
| Placed pins should be in the background | Chips and DIP switches render underneath wires/parts, and their legs are drawn behind the body | `ChipOnBoard.tsx`, `DipSwitchOnBoard.tsx`, `Breadboard.tsx` |
| Click-then-place | Library is drag-and-drop: drag any part onto the board (ghost preview + snap). Resistors drop spanning 3 holes, LEDs drop into one hole. Esc cancels | `SandboxClient.tsx`, `Breadboard.tsx` |

## Check
```
npm run check:bedroom
npm run dev   # open /bedroom and /sandbox
```
