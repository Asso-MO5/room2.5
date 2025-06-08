import { TextureManager } from "./TextureManager";

/**
 * Represents a tile in the game map.
 * Each tile has a type, can be solid or not, and may have a texture.
 */
export interface Tile {
  type: number;
  name: string;
  texture?: string;
  height?: number;
  isSolid: boolean;
}

/**
 * Defines the properties of a tile type.
 * Used to register new tile types with their specific properties.
 */
export interface TileDefinition {
  type: number;
  name: string;
  texture: string;
  isSolid: boolean;
  height?: number;
}

/**
 * Represents an item that can be placed in the map.
 * Items can be collectible and have a specific position and texture.
 */
export interface Item {
  type: string;
  x: number;
  y: number;
  texture: string;
  isCollectible: boolean;
}

/**
 * Abstract base class for game maps.
 * Handles tile management, texture loading, and map rendering.
 * 
 * @example
 * ```typescript
 * class MyMap extends Map {
 *   constructor() {
 *     super([
 *       [1, 1, 1, 1],
 *       [1, 0, 0, 1],
 *       [1, 0, 0, 1],
 *       [1, 1, 1, 1]
 *     ]);
 *     this.initializeTileDefinitions();
 *   }
 * 
 *   protected initializeTileDefinitions(): void {
 *     this.registerTileDefinition(1, {
 *       type: 1,
 *       name: "wall",
 *       texture: "brick",
 *       isSolid: true
 *     });
 *   }
 * }
 * ```
 */
export abstract class Map {
  protected readonly tiles: Tile[][];
  protected readonly items: Item[];
  protected readonly floorTexture: string;
  protected readonly ceilingTexture: string;
  protected tileDefinitions: { [key: number]: TileDefinition };
  protected textureManager: TextureManager;

  /**
   * Creates a new Map instance.
   * 
   * @param mapData - 2D array of numbers representing the map layout
   * @param floorTexture - Texture name for the floor (default: "grey")
   * @param ceilingTexture - Texture name for the ceiling (default: "darkgrey")
   */
  constructor(
    mapData: number[][],
    floorTexture: string = "grey",
    ceilingTexture: string = "darkgrey"
  ) {
    this.floorTexture = floorTexture;
    this.ceilingTexture = ceilingTexture;
    this.items = [];
    this.tileDefinitions = {};
    this.textureManager = new TextureManager();
    this.initializeTileDefinitions();
    this.tiles = this.initializeTiles(mapData);
  }

  /**
   * Abstract method that must be implemented by subclasses to initialize tile definitions.
   * This is where you register all tile types with their properties.
   */
  protected abstract initializeTileDefinitions(): void;

  /**
   * Registers a new tile definition with the map.
   * 
   * @param type - The numeric type identifier for the tile
   * @param definition - The tile definition containing its properties
   */
  protected registerTileDefinition(type: number, definition: TileDefinition): void {
    this.textureManager.createTexture(type, definition.name, `./textures/${definition.texture}.png`);
    this.tileDefinitions[type] = definition;
  }

  /**
   * Initializes the tile array from the map data.
   * 
   * @param mapData - 2D array of numbers representing the map layout
   * @returns 2D array of Tile objects
   */
  protected initializeTiles(mapData: number[][]): Tile[][] {
    return mapData.map(row =>
      row.map(tileType => this.createTile(tileType))
    );
  }

  /**
   * Creates a tile instance from a tile type number.
   * 
   * @param type - The numeric type identifier for the tile
   * @returns A new Tile instance
   */
  protected createTile(type: number): Tile {
    const definition = this.tileDefinitions[type];

    if (!definition) {
      return {
        type: 0,
        name: "empty",
        isSolid: false,
        texture: "empty"
      };
    }

    return definition;
  }

  /**
   * Gets the tile at the specified coordinates.
   * 
   * @param x - X coordinate in the map
   * @param y - Y coordinate in the map
   * @returns The tile at the specified coordinates, or undefined if out of bounds
   */
  public getTile(x: number, y: number): Tile | undefined {
    return this.tiles[y]?.[x];
  }

  /**
   * Checks if a tile at the specified coordinates is solid.
   * 
   * @param x - X coordinate in the map
   * @param y - Y coordinate in the map
   * @returns true if the tile is solid or out of bounds, false otherwise
   */
  public isSolid(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile?.isSolid ?? true;
  }

  /**
   * Adds an item to the map.
   * 
   * @param item - The item to add
   */
  public addItem(item: Item): void {
    this.items.push(item);
  }

  /**
   * Gets all items in the map.
   * 
   * @returns Array of all items in the map
   */
  public getItems(): Item[] {
    return this.items;
  }

  /**
   * Gets the floor texture name.
   * 
   * @returns The floor texture name
   */
  public getFloorTexture(): string {
    return this.floorTexture;
  }

  /**
   * Gets the ceiling texture name.
   * 
   * @returns The ceiling texture name
   */
  public getCeilingTexture(): string {
    return this.ceilingTexture;
  }

  /**
   * Gets the color of a texture at specific coordinates.
   * 
   * @param textureName - Name of the texture
   * @param x - X coordinate in the texture
   * @param y - Y coordinate in the texture
   * @returns The color at the specified coordinates
   */
  public getTextureColor(textureName: string, x: number, y: number): string {
    return this.textureManager.getTextureColor(textureName, x, y);
  }
}