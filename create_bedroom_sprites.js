const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createSprites() {
  const themes = ['classic', 'nodex'];
  
  for (const theme of themes) {
    const base = 'public/assets/bedroom/' + theme;
    const tilesDir = path.join(base, 'tiles');
    const furnitureDir = path.join(base, 'furniture');
    const charsDir = path.join(base, 'characters');
    
    [tilesDir, furnitureDir, charsDir].forEach(d => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });
    
    const floorColor = theme === 'nodex' ? {r: 107, g: 91, b: 115} : {r: 139, g: 115, b: 85};
    await sharp({
      create: { width: 32, height: 32, channels: 4, background: { ...floorColor, alpha: 1 } }
    }).png().toFile(path.join(tilesDir, 'floor.png'));
    
    const wallColor = theme === 'nodex' ? {r: 74, g: 78, b: 105} : {r: 210, g: 105, b: 30};
    await sharp({
      create: { width: 32, height: 32, channels: 4, background: { ...wallColor, alpha: 1 } }
    }).png().toFile(path.join(tilesDir, 'wall.png'));
    
    await sharp({ create: { width: 80, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(path.join(furnitureDir, 'bed.png'));
    await sharp({ create: { width: 64, height: 48, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(path.join(furnitureDir, 'computer.png'));
    await sharp({ create: { width: 48, height: 48, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(path.join(furnitureDir, 'drawer.png'));
    await sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(path.join(furnitureDir, 'bookshelf.png'));
    await sharp({ create: { width: 56, height: 48, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(path.join(furnitureDir, 'tv.png'));
    await sharp({ create: { width: 32, height: 20, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(path.join(furnitureDir, 'console.png'));
    await sharp({ create: { width: 96, height: 64, channels: 4, background: { r: theme === 'nodex' ? 154 : 139, g: theme === 'nodex' ? 140 : 0, b: theme === 'nodex' ? 152 : 0, alpha: 0.7 } } }).png().toFile(path.join(furnitureDir, 'rug.png'));
    await sharp({ create: { width: 24, height: 32, channels: 4, background: { r: 74, g: 144, b: 226, alpha: 1 } } }).png().toFile(path.join(charsDir, 'player.png'));
    await sharp({ create: { width: 24, height: 32, channels: 4, background: { r: 34, g: 139, b: 34, alpha: 1 } } }).png().toFile(path.join(charsDir, 'npc.png'));
  }
  
  console.log('done');
}

createSprites().catch(console.error);
