# NODEX bedroom import repair

## What happened

`components/bedroom/BedroomScene.jsx` imports `@/data/isoBedroomObjects`.
The ZIP contains `data/isoBedroomObjects.js`, but a Next.js "Module not found" error means the file is not present or not visible in the **project directory actually running your server**. This commonly happens if files from different project ZIP versions were mixed or copied incompletely.

## Fix using the repair patch

1. Stop the local server (Ctrl+C).
2. Find the project directory containing `package.json` and `components/bedroom/BedroomScene.jsx`.
3. Extract the patch INTO that directory, preserving the folder paths:
   - `data/isoBedroomObjects.js`
   - `utils/bedroomGeometry.js`
   - `scripts/verify-bedroom-files.mjs`
4. Check that `data/isoBedroomObjects.js` is next to `data/bedroomObjects.js`.
5. In that same directory run:

   ```powershell
   node scripts/verify-bedroom-files.mjs
   npm run dev
   ```

6. Reopen `http://localhost:3000/bedroom` (or the port Next.js reports, e.g. 3001).

If the old error remains after confirming the file is present, stop Next.js and remove `.next` (only the generated cache), then restart `npm run dev`.

## Alternative: full fresh extraction

Extract the full updated ZIP into a NEW empty folder. Open *that exact folder* (the one with `package.json`) and run `npm install` then `npm run dev`. Do not copy only `components/` into an older NODEX project.

## Quick diagnosis in PowerShell

```powershell
Get-Location
Test-Path .\data\isoBedroomObjects.js
Test-Path .\utils\bedroomGeometry.js
node scripts/verify-bedroom-files.mjs
```

Both `Test-Path` checks must report `True`.

Note: checking import paths and the geometry test are possible offline. Running a full Next.js production build requires installed npm dependencies.
