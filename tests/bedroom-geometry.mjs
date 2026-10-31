import assert from 'node:assert/strict';
import { ROOM_OBJECTS, SOLID_SCENE_AREAS, WALKABLE_POLYGON, INTERACTION_REACH, GUIDE_POSITION, PLAYER_SPAWN } from '../data/isoBedroomObjects.js';
import { isBedroomPositionBlocked, nearestInteractive } from '../utils/bedroomGeometry.js';

// Positions are sprite top-left; feet are at (+39, +106).
const blocked = (x, y) => isBedroomPositionBlocked(x, y, ROOM_OBJECTS, SOLID_SCENE_AREAS, WALKABLE_POLYGON);
const near = (x, y) => nearestInteractive(x, y, ROOM_OBJECTS, INTERACTION_REACH)?.id ?? null;

assert.equal(blocked(PLAYER_SPAWN.x, PLAYER_SPAWN.y), false, 'player spawn should be walkable');
assert.equal(blocked(GUIDE_POSITION.x, GUIDE_POSITION.y), false, 'guide should stand on open floor');

// The old invisible wall on the lower edge of the rug is gone.
for (let x = 700; x <= 1000; x += 20) assert.equal(blocked(x, 545), false, `rug edge should be walkable at x=${x}`);
// Gaps between back-wall furniture are walkable.
assert.equal(blocked(620, 180), false, 'gap between desk and drawer should be walkable');
assert.equal(blocked(925, 180), false, 'gap between drawer and bookshelf should be walkable');

// Still blocked: furniture, stairs and outside the room.
assert.equal(blocked(260, 520), true, 'player should not walk inside the bed');
assert.equal(blocked(1200, 420), true, 'player should not walk through the TV');
assert.equal(blocked(1220, 600), true, 'player should not walk into the stair opening');
assert.equal(blocked(0, 0), true, 'player should not leave the room');

// Interaction only when standing right next to the object.
assert.equal(near(380, 440), 'bed', 'bed usable when standing beside it');
assert.equal(near(470, 260), 'computer', 'computer usable from in front of the desk');
assert.equal(near(800, 205), 'drawer', 'drawer usable from in front');
assert.equal(near(1100, 205), 'bookshelf', 'bookshelf usable from in front');
assert.equal(near(1080, 420), 'tv', 'TV usable from its left side');
assert.equal(near(700, 450), null, 'nothing is usable from the middle of the room');
assert.equal(near(470, 330), null, 'computer is NOT usable from far away');

console.log('NODEX bedroom geometry smoke tests passed');
