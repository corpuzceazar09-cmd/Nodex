// Screen-space hotspots for the 3/4-perspective NODEX room art (1536x1024).
// Collision boxes are the furniture *floor footprints* measured against the
// player's feet, so the player can walk right up to every object.
export const STAGE_WIDTH = 1536;
export const STAGE_HEIGHT = 1024;

// How close (in px, feet → footprint edge) the player must be to interact.
export const INTERACTION_REACH = 34;

export const ROOM_OBJECTS = {
  computer: {
    id: 'computer', type: 'computer', name: 'Computer',
    prompt: 'Press [E] to Use Computer',
    collision: true, collisionBox: { x: 358, y: 298, width: 208, height: 57 },
  },
  drawer: {
    id: 'drawer', type: 'drawer', name: 'Drawer',
    prompt: 'Press [E] to Open Drawer',
    collision: true, collisionBox: { x: 762, y: 262, width: 146, height: 42 },
  },
  bookshelf: {
    id: 'bookshelf', type: 'bookshelf', name: 'Bookshelf',
    prompt: 'Press [E] to Read Books',
    collision: true, collisionBox: { x: 1028, y: 262, width: 220, height: 40 },
  },
  bed: {
    id: 'bed', type: 'bed', name: 'Bed',
    prompt: 'Press [E] to Rest',
    collision: true, collisionBox: { x: 205, y: 445, width: 203, height: 268 },
  },
  tv: {
    id: 'tv', type: 'tv', name: 'Television',
    prompt: 'Press [E] to Watch TV',
    collision: true, collisionBox: { x: 1150, y: 480, width: 180, height: 105 },
  },
};

// Non-interactive things the player must not walk through.
export const SOLID_SCENE_AREAS = [
  { x: 1112, y: 636, width: 340, height: 150 }, // stair opening / banister
  { x: 416, y: 330, width: 66, height: 50 },    // desk stool
  { x: 330, y: 410, width: 78, height: 40 },    // bedside table
  { x: 1188, y: 555, width: 118, height: 48 },  // game console + controller
  { x: 128, y: 598, width: 68, height: 98 },    // left plant
  { x: 1378, y: 548, width: 64, height: 92 },   // right plant
];

// Walkable wooden floor (feet coordinates). Follows the visible floor edges,
// including the gaps between the furniture along the back wall and the doorway.
export const WALKABLE_POLYGON = [
  [292, 352], [352, 300], [356, 272], [1262, 272], [1398, 440],
  [1430, 690], [1110, 690], [1110, 752], [862, 752], [862, 800],
  [605, 800], [605, 752], [185, 752], [140, 702], [140, 468], [205, 418],
];

// Where the professor stands during the introduction: open floor at the side
// of the room, between the bookshelf and the TV.
export const GUIDE_POSITION = { x: 1040, y: 352 };
export const PLAYER_SPAWN = { x: 630, y: 646 };
