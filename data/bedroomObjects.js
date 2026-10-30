import { TILE_SIZE } from "./bedroomMap";

// Interactive objects positions (pixel coordinates based on tiles)
export const INTERACTIVE_OBJECTS = {
  computer: {
    id: "computer",
    type: "computer",
    name: "Computer",
    x: 64,
    y: 32,
    width: 64,
    height: 48,
    interactionDistance: 48,
    prompt: "Press [E] to Use Computer",
    collision: true,
    collisionBox: { x: 64, y: 32, width: 64, height: 48 }
  },
  drawer: {
    id: "drawer",
    type: "drawer",
    name: "Drawer",
    x: 256,
    y: 32,
    width: 48,
    height: 48,
    interactionDistance: 48,
    prompt: "Press [E] to Open Drawer",
    collision: true,
    collisionBox: { x: 256, y: 32, width: 48, height: 48 }
  },
  bookshelf: {
    id: "bookshelf",
    type: "bookshelf",
    name: "Bookshelf",
    x: 416,
    y: 32,
    width: 64,
    height: 64,
    interactionDistance: 48,
    prompt: "Press [E] to Read Books",
    collision: true,
    collisionBox: { x: 416, y: 32, width: 64, height: 64 }
  },
  bed: {
    id: "bed",
    type: "bed",
    name: "Bed",
    x: 32,
    y: 256,
    width: 80,
    height: 64,
    interactionDistance: 48,
    prompt: "Press [E] to Rest",
    collision: true,
    collisionBox: { x: 32, y: 256, width: 80, height: 64 },
    interactableFrom: ["down"] // can interact from below or sides
  },
  tv: {
    id: "tv",
    type: "tv",
    name: "Television",
    x: 384,
    y: 224,
    width: 56,
    height: 48,
    interactionDistance: 48,
    prompt: "Press [E] to Watch TV",
    collision: true,
    collisionBox: { x: 384, y: 224, width: 56, height: 48 }
  },
  console: {
    id: "console",
    type: "console",
    name: "Game Console",
    x: 384,
    y: 272,
    width: 32,
    height: 20,
    interactionDistance: 40,
    prompt: null, // not primary interactable or just decorative
    collision: true,
    collisionBox: { x: 384, y: 272, width: 32, height: 20 }
  }
};

export const getObjectById = (id) => {
  return Object.values(INTERACTIVE_OBJECTS).find(obj => obj.id === id);
};
