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

export function isBedroomPositionBlocked(spriteX, spriteY, objects, solidAreas, walkable) {
  // Feet, rather than the entire sprite, determine collisions for an RPG character.
  const footX = spriteX + 39;
  const footY = spriteY + 106;
  if (!pointInPolygon(footX, footY, walkable)) return true;
  return [...Object.values(objects).filter(o => o.collision).map(o => o.collisionBox), ...solidAreas]
    .some(box => pointInBox(footX, footY, box, 8));
}
