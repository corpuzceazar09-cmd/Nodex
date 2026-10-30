// Run from the NODEX project root: node scripts/verify-bedroom-files.mjs
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const required = [
  'package.json',
  'components/bedroom/BedroomScene.jsx',
  'data/isoBedroomObjects.js',
  'utils/bedroomGeometry.js',
  'data/tutorialDialogue.js',
  'hooks/usePlayerMovement.js',
  'hooks/useInteraction.js',
  'public/assets/bedroom/classic/room-iso.png',
  'public/assets/bedroom/nodex/room-iso.png'
];
const missing = required.filter(relative => !existsSync(resolve(process.cwd(), relative)));
if (missing.length) {
  console.error('NODEX: missing required files in the current folder:');
  for (const relative of missing) console.error(`  - ${relative}`);
  console.error('Make sure you extracted the complete ZIP into this project folder.');
  process.exitCode = 1;
} else {
  const scene = readFileSync(resolve('components/bedroom/BedroomScene.jsx'), 'utf8');
  const data = readFileSync(resolve('data/isoBedroomObjects.js'), 'utf8');
  if (!scene.includes('@/data/isoBedroomObjects') || !data.includes('export const ROOM_OBJECTS')) {
    console.error('NODEX: bedroom file versions are mismatched. Use the complete updated ZIP.');
    process.exitCode = 1;
  } else {
    console.log('NODEX: all required bedroom files are present.');
    console.log('Run `npm run dev` to test the bedroom in your browser.');
  }
}
