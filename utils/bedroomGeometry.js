export const FOOT_OFFSET = { x: 39, y: 106 };

export function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function pointInBox(x, y, box, padding = 0) {
  return x >= box.x - padding && x <= box.x + box.width + padding &&
    y >= box.y - padding && y <= box.y + box.height + padding;
}

export function distanceToBox(x, y, box) {
  const dx = Math.max(box.x - x, 0, x - (box.x + box.width));
  const dy = Math.max(box.y - y, 0, y - (box.y + box.height));
  return Math.hypot(dx, dy);
}

export function feetOf(spriteX, spriteY) {
  return { x: spriteX + FOOT_OFFSET.x, y: spriteY + FOOT_OFFSET.y };
}

export function isBedroomPositionBlocked(spriteX, spriteY, objects, solidAreas, walkable) {
  // Feet, rather than the entire sprite, determine collisions for an RPG character.
  const { x: footX, y: footY } = feetOf(spriteX, spriteY);
  if (!pointInPolygon(footX, footY, walkable)) return true;
  return [...Object.values(objects).filter(o => o.collision).map(o => o.collisionBox), ...solidAreas]
    .some(box => pointInBox(footX, footY, box, 6));
}

/** Closest interactive object whose footprint is within reach of the feet. */
export function nearestInteractive(spriteX, spriteY, objects, reach) {
  const { x, y } = feetOf(spriteX, spriteY);
  let best = null;
  let bestDistance = Infinity;
  for (const obj of Object.values(objects)) {
    if (!obj.prompt || !obj.collisionBox) continue;
    const d = distanceToBox(x, y, obj.collisionBox);
    if (d <= reach && d < bestDistance) { best = obj; bestDistance = d; }
  }
  return best;
}
