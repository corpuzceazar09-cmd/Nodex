import assert from 'node:assert/strict';
import { ROOM_OBJECTS, SOLID_SCENE_AREAS, WALKABLE_POLYGON } from '../data/isoBedroomObjects.js';
import { isBedroomPositionBlocked } from '../utils/bedroomGeometry.js';

const blocked = (x, y) => isBedroomPositionBlocked(x, y, ROOM_OBJECTS, SOLID_SCENE_AREAS, WALKABLE_POLYGON);
assert.equal(blocked(630, 646), false, 'player spawn should be walkable');
assert.equal(blocked(690, 505), false, 'guide should spawn on open floor');
assert.equal(blocked(405, 540), false, 'player should stand beside the bed');
assert.equal(blocked(440, 350), false, 'computer interaction position should be walkable');
assert.equal(blocked(760, 340), false, 'drawer interaction position should be walkable');
assert.equal(blocked(1080, 500), false, 'television interaction position should be walkable');
assert.equal(blocked(170, 520), true, 'player should not walk inside the bed');
assert.equal(blocked(1200, 550), true, 'player should not walk through the TV');
assert.equal(blocked(0, 0), true, 'player should not leave the room');

const near = (pos, object) => {
  const x=pos.x + 39, y=pos.y + 57;
  const px=Math.max(object.x,Math.min(x,object.x+object.width));
  const py=Math.max(object.y,Math.min(y,object.y+object.height));
  return Math.hypot(x-px,y-py) <= object.interactionDistance;
};
assert(near({x:405,y:540},ROOM_OBJECTS.bed), 'bed should be interactive when standing beside it');
assert(near({x:440,y:350},ROOM_OBJECTS.computer), 'computer should be interactive');
console.log('NODEX bedroom geometry smoke tests passed');
