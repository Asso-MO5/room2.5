import { Player } from "../entities/Player";
import { Map } from "./Map";

/**
 * A raycasting renderer for a 3D-like game engine.
 * This renderer uses the raycasting technique to create a pseudo-3D effect,
 * similar to games like Wolfenstein 3D.
 * 
 * @example
 * ```typescript
 * const canvas = document.getElementById('canvas') as HTMLCanvasElement;
 * const renderer = new Renderer(canvas, {
 *   tileSize: 64,
 *   fov: Math.PI / 3,
 *   numRays: canvas.width,
 *   projectionPlaneDistance: 256,
 *   defaultFogColor: { r: 7, g: 7, b: 7 }
 * });
 * ```
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private TILE_SIZE = 64;
  private FOV = Math.PI / 3;
  private NUM_RAYS: number;
  private PROJECTION_PLANE_DISTANCE = 64 * 4;
  private DEFAULT_FOG_COLOR = { r: 7, g: 7, b: 7 };
  private MAX_RAY_DISTANCE = 1000;

  /**
   * Creates a new Renderer instance.
   * 
   * @param canvas - The HTML canvas element to render on
   * @param options - Configuration options for the renderer
   * @param options.tileSize - Size of each tile in pixels (default: 64)
   * @param options.fov - Field of view in radians (default: Math.PI / 3)
   * @param options.numRays - Number of rays to cast (default: canvas width)
   * @param options.projectionPlaneDistance - Distance to the projection plane (default: 256)
   * @param options.defaultFogColor - RGB color for the fog effect (default: { r: 7, g: 7, b: 7 })
   * @param options.maxRayDistance - Maximum distance to cast a ray (default: 1000)
   * @example
   * ```typescript
   * // Create a renderer with custom FOV and fog color
   * const renderer = new Renderer(canvas, {
   *   fov: Math.PI / 4,  // Narrower FOV
   *   defaultFogColor: { r: 10, g: 10, b: 15 }  // Bluish fog
   * });
   * ```
   */
  constructor(canvas: HTMLCanvasElement, options: {
    tileSize?: number;
    fov?: number;
    numRays?: number;
    projectionPlaneDistance?: number;
    defaultFogColor?: { r: number, g: number, b: number };
    maxRayDistance?: number;
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.NUM_RAYS = canvas.width;
    this.TILE_SIZE = options.tileSize ?? this.TILE_SIZE;
    this.FOV = options.fov ?? this.FOV;
    this.NUM_RAYS = options.numRays ?? this.NUM_RAYS;
    this.PROJECTION_PLANE_DISTANCE = options.projectionPlaneDistance ?? this.PROJECTION_PLANE_DISTANCE;
    this.DEFAULT_FOG_COLOR = options.defaultFogColor ?? this.DEFAULT_FOG_COLOR;
    this.MAX_RAY_DISTANCE = options.maxRayDistance ?? this.MAX_RAY_DISTANCE;
  }

  /**
   * Renders the current view based on player position and map data.
   * This method handles the entire rendering process including:
   * - Drawing the ceiling and floor
   * - Casting rays for wall rendering
   * - Applying textures and fog effects
   * 
   * @param player - The player entity containing position and angle
   * @param map - The game map containing tiles and textures
   */
  render(player: Player, map: Map) {
    if (!this.ctx) return;

    this.ctx.fillStyle = map.getCeilingTexture();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);

    this.ctx.fillStyle = map.getFloorTexture();
    this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

    for (let i = 0; i < this.NUM_RAYS; i++) {

      const rayAngle = player.angle - this.FOV / 2 + (i / this.NUM_RAYS) * this.FOV;
      const { distance, hitX, hitY, tile } = this.castRay(rayAngle, player, map);
      const wallHeight = (this.TILE_SIZE * this.PROJECTION_PLANE_DISTANCE) / (distance + 0.0001);

      if (tile) {
        let wallX;
        if (Math.abs(hitX - Math.floor(hitX + 0.5)) > Math.abs(hitY - Math.floor(hitY + 0.5))) {
          wallX = hitX - Math.floor(hitX);
        } else {
          wallX = hitY - Math.floor(hitY);
        }
        const textureX = Math.floor(wallX * this.TILE_SIZE);

        const drawStart = Math.floor((this.canvas.height - wallHeight) / 2);
        const drawEnd = Math.floor((this.canvas.height + wallHeight) / 2);

        for (let y = drawStart; y < drawEnd; y++) {
          const d = y - this.canvas.height / 2 + wallHeight / 2;
          const textureY = Math.floor(d * this.TILE_SIZE / wallHeight);
          this.ctx.fillStyle = this.getWallColor(tile, textureX, textureY, map, distance);
          this.ctx.fillRect(i, y, 1, 1);
        }
      }
    }
  }

  /**
   * Casts a ray from the player's position at a specific angle and returns information about the first wall hit.
   * 
   * @param rayAngle - The angle at which to cast the ray
   * @param player - The player entity containing position
   * @param map - The game map to check for collisions
   * @returns Object containing distance to wall, hit coordinates, and hit tile
   */
  private castRay(rayAngle: number, player: Player, map: Map) {
    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);

    let distance = 0;
    let hit = false;
    let hitX = 0;
    let hitY = 0;
    let hitTile = null;

    while (!hit && distance < this.MAX_RAY_DISTANCE) {
      distance += 1;
      hitX = (player.x + cos * distance) / this.TILE_SIZE;
      hitY = (player.y + sin * distance) / this.TILE_SIZE;
      const testX = Math.floor(hitX);
      const testY = Math.floor(hitY);

      const tile = map.getTile(testX, testY);
      if (tile?.isSolid) {
        hit = true;
        hitTile = tile;
      }
    }
    return { distance, hitX, hitY, tile: hitTile };
  }

  /**
   * Calculates the color of a wall pixel with fog effect applied.
   * The fog intensity increases with distance, creating a depth effect.
   * 
   * @param tile - The tile that was hit
   * @param textureX - X coordinate in the texture
   * @param textureY - Y coordinate in the texture
   * @param map - The game map containing textures
   * @param distance - Distance from player to the wall
   * @returns RGB color string with fog effect applied
   */
  private getWallColor(tile: any, textureX: number, textureY: number, map: Map, distance: number): string {
    if (!tile?.texture) return "#ffffff";

    const baseColor = map.getTextureColor(tile.name, textureX, textureY);
    const fogColor = this.DEFAULT_FOG_COLOR;

    let r = 255, g = 255, b = 255;
    const match = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      r = parseInt(String(match[1]));
      g = parseInt(String(match[2]));
      b = parseInt(String(match[3]));
    }

    const fogStart = 300;
    const fogEnd = 700;
    let fogFactor = (distance - fogStart) / (fogEnd - fogStart);
    fogFactor = Math.max(0, Math.min(1, fogFactor));

    r = Math.round(r * (1 - fogFactor) + fogColor.r * fogFactor);
    g = Math.round(g * (1 - fogFactor) + fogColor.g * fogFactor);
    b = Math.round(b * (1 - fogFactor) + fogColor.b * fogFactor);

    return `rgb(${r},${g},${b})`;
  }
} 