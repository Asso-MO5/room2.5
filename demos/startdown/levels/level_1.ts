import { Map } from "../../../core/engine/Map";

enum TileType {
  WALL = 1,
  INSIDE_WALL = 2,
  SECRET = 3,
  ITEM = 4,
  WINDOW = 5,
  STAIRS = 6,
  ELEVATOR = 7,
  TRAP = 8,
  CHEST = 9,
  PORTAL = 10
}

export class Level1 extends Map {

  constructor() {
    super([
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ], "#525252", "#999");

    this.initializeTileDefinitions();

    /* TODO manage items
    this.addItem({
      type: "health",
      x: 2,
      y: 2,
      texture: "health_pack",
      isCollectible: true
    });
    */
  }

  getTextureColor(textureName: string, x: number, y: number): string {
    return this.textureManager.getTextureColor(textureName, x, y);
  }

  protected async initializeTileDefinitions() {

    this.registerTileDefinition(1, {
      type: TileType.WALL,
      name: "wall",
      texture: "wall",
      isSolid: true
    });

    this.registerTileDefinition(2, {
      type: TileType.INSIDE_WALL,
      name: "inside_wall",
      texture: "wall_blue",
      isSolid: true
    });
  }
}
