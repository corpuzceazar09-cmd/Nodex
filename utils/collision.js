export const checkCollision = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

export const checkWallCollision = (playerX, playerY, playerWidth, playerHeight, mapWidth, mapHeight, tileSize) => {
  // Check if player would go outside map bounds or hit walls
  const leftTile = Math.floor(playerX / tileSize);
  const rightTile = Math.floor((playerX + playerWidth - 1) / tileSize);
  const topTile = Math.floor(playerY / tileSize);
  const bottomTile = Math.floor((playerY + playerHeight - 1) / tileSize);
  
  // Map boundaries are walls
  if (leftTile < 0 || rightTile >= mapWidth || topTile < 0 || bottomTile >= mapHeight) {
    return true;
  }
  return false;
};

export const getDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};
