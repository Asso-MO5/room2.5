import { Map } from "../engine/Map";
import { Player } from "../entities/Player";

/**
 * Configuration options for the MiniMap
 */
interface MiniMapOptions {
  /** Size of a tile on the minimap in pixels */
  tileSize?: number;
  /** Margin around the minimap in pixels */
  margin?: number;
  /** Color of walls on the minimap */
  wallColor?: string;
  /** Color of the floor on the minimap */
  floorColor?: string;
  /** Color of the player on the minimap */
  playerColor?: string;
  /** Color of the player's direction indicator on the minimap */
  directionColor?: string;
  /** Length of the direction line in game units */
  directionLength?: number;
}

/**
 * Class managing the minimap display
 * Displays a simplified top-down view of the map and player position
 * 
 * @example
 * ```typescript
 * const minimap = new MiniMap({
 *   tileSize: 2,
 *   margin: 2,
 *   wallColor: "#00ff00",
 *   playerColor: "#ff0000"
 * });
 * ```
 */
export class MiniMap {
  /** Size of a tile on the minimap in pixels */
  private readonly tileSize: number;
  /** Margin around the minimap in pixels */
  private readonly margin: number;
  /** Color of walls on the minimap */
  private readonly wallColor: string;
  /** Color of the floor on the minimap */
  private readonly floorColor: string;
  /** Color of the player on the minimap */
  private readonly playerColor: string;
  /** Color of the player's direction indicator on the minimap */
  private readonly directionColor: string;
  /** Length of the direction line in game units */
  private readonly directionLength: number;

  /**
   * Creates a new MiniMap instance
   * 
   * @param options - Configuration options for the minimap
   * @param options.tileSize - Size of a tile on the minimap (default: 1)
   * @param options.margin - Margin around the minimap (default: 1)
   * @param options.wallColor - Color of walls (default: "green")
   * @param options.floorColor - Color of the floor (default: "black")
   * @param options.playerColor - Color of the player (default: "red")
   * @param options.directionColor - Color of the direction indicator (default: "yellow")
   * @param options.directionLength - Length of the direction line (default: 20)
   */
  constructor(options: MiniMapOptions = {}) {
    this.tileSize = options.tileSize ?? 1;
    this.margin = options.margin ?? 1;
    this.wallColor = options.wallColor ?? "green";
    this.floorColor = options.floorColor ?? "black";
    this.playerColor = options.playerColor ?? "red";
    this.directionColor = options.directionColor ?? "yellow";
    this.directionLength = options.directionLength ?? 20;
  }

  /**
   * Renders the minimap on the provided canvas
   * 
   * @param ctx - The canvas rendering context
   * @param map - The game map
   * @param player - The player
   */
  render(ctx: CanvasRenderingContext2D, map: Map, player: Player) {
    const tiles = (map as any)["tiles"];
    if (!tiles) return;

    // Draw tiles
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = map.getTile(x, y);
        ctx.fillStyle = tile?.isSolid ? this.wallColor : this.floorColor;
        ctx.fillRect(
          this.margin + x * this.tileSize,
          this.margin + y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }

    // Draw player
    ctx.fillStyle = this.playerColor;
    ctx.beginPath();
    ctx.arc(
      this.margin + (player.x / 64) * this.tileSize,
      this.margin + (player.y / 64) * this.tileSize,
      this.tileSize / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw player direction
    ctx.strokeStyle = this.directionColor;
    ctx.beginPath();
    ctx.moveTo(
      this.margin + (player.x / 64) * this.tileSize,
      this.margin + (player.y / 64) * this.tileSize
    );
    ctx.lineTo(
      this.margin + ((player.x + Math.cos(player.angle) * this.directionLength) / 64) * this.tileSize,
      this.margin + ((player.y + Math.sin(player.angle) * this.directionLength) / 64) * this.tileSize
    );
    ctx.stroke();
  }
} 