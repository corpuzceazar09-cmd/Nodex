// Screen-space hotspots for the original 3/4-perspective NODEX Classic room.
// Keep these independent from the artwork so furniture remains interactive.
// x/y are image coordinates in the 1536x1024 room art.
export const STAGE_WIDTH = 1536;
export const STAGE_HEIGHT = 1024;

export const ROOM_OBJECTS = {
  computer: {
    id: 'computer', type: 'computer', name: 'Computer',
    x: 349, y: 227, width: 211, height: 145,
    interactionDistance: 95, prompt: 'Press [E] to Use Computer',
    collision: true, collisionBox: { x: 355, y: 284, width: 202, height: 82 },
    outline: '350,247 374,195 521,190 565,233 567,356 352,356'
  },
  drawer: {
    id: 'drawer', type: 'drawer', name: 'Drawer',
    x: 751, y: 187, width: 158, height: 123,
    interactionDistance: 85, prompt: 'Press [E] to Open Drawer',
    collision: true, collisionBox: { x: 761, y: 258, width: 146, height: 63 },
    outline: '749,194 897,190 908,310 753,308'
  },
  bookshelf: {
    id: 'bookshelf', type: 'bookshelf', name: 'Bookshelf',
    x: 1025, y: 112, width: 220, height: 205,
    interactionDistance: 95, prompt: 'Press [E] to Read Books',
    collision: true, collisionBox: { x: 1031, y: 256, width: 211, height: 68 },
    outline: '1026,112 1244,112 1250,309 1023,313'
  },
  bed: {
    id: 'bed', type: 'bed', name: 'Bed',
    x: 202, y: 437, width: 200, height: 268,
    interactionDistance: 100, prompt: 'Press [E] to Rest',
    collision: true, collisionBox: { x: 207, y: 468, width: 197, height: 239 },
    outline: '221,427 391,432 398,697 205,701 199,474'
  },
  tv: {
    id: 'tv', type: 'tv', name: 'Television',
    x: 1160, y: 391, width: 167, height: 235,
    interactionDistance: 100, prompt: 'Press [E] to Watch TV',
    collision: true, collisionBox: { x: 1154, y: 484, width: 175, height: 146 },
    outline: '1169,400 1313,398 1326,621 1153,622'
  },
};

// Noninteractive areas the player must not enter.
export const SOLID_SCENE_AREAS = [
  { x: 1121, y: 635, width: 330, height: 152 }, // stair opening / banister
  { x: 405, y: 350, width: 110, height: 40 }, // desk chair
  { x: 760, y: 628, width: 245, height: 52 }, // TV console and controller area
];

// The visible wooden floor has angled edges, not a rectangular collider.
export const WALKABLE_POLYGON = [
  [298, 331], [1225, 323], [1390, 441], [1425, 681],
  [1120, 760], [1094, 815], [623, 815], [208, 732], [150, 650],
  [151, 461],
];
