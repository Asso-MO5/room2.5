/**
 * Defines the properties of a texture.
 * Used when creating new textures in the manager.
 */
export interface TextureDefinition {
  id: number;
  name: string;
  path: string;
}

/**
 * Manages game textures, handling loading, caching, and color sampling.
 * This class is responsible for loading texture images, caching their data,
 * and providing efficient access to pixel colors.
 * 
 * @example
 * ```typescript
 * const textureManager = new TextureManager();
 * 
 * // Load a texture
 * await textureManager.createTexture(1, "wall", "/textures/wall.png");
 * 
 * // Get a color from the texture
 * const color = textureManager.getTextureColor("wall", 32, 32);
 * ```
 */
export class TextureManager {
  private textures: Map<number, HTMLImageElement> = new Map();
  private textureData: Map<string, ImageData> = new Map();
  private textureNames: Map<string, number> = new Map();

  /**
   * Creates and loads a new texture.
   * The texture is cached for future use and its pixel data is preloaded.
   * 
   * @param id - Unique identifier for the texture
   * @param name - Name of the texture for reference
   * @param path - Path to the texture image file
   * @returns Promise that resolves with the texture ID when loading is complete
   * @throws Error if the texture fails to load
   * 
   * @example
   * ```typescript
   * try {
   *   await textureManager.createTexture(1, "brick", "/textures/brick.png");
   *   console.log("Texture loaded successfully");
   * } catch (error) {
   *   console.error("Failed to load texture:", error);
   * }
   * ```
   */
  async createTexture(id: number, name: string, path: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.textures.set(id, img);
        this.textureNames.set(name, id);

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          this.textureData.set(name, ctx.getImageData(0, 0, img.width, img.height));
        }
        resolve(id);
      };
      img.onerror = reject;
      img.src = path;
    });
  }

  /**
   * Gets the ID of a texture by its name.
   * 
   * @param name - Name of the texture
   * @returns The texture ID if found, undefined otherwise
   */
  getTextureId(name: string): number | undefined {
    return this.textureNames.get(name);
  }

  /**
   * Gets the color of a pixel in a texture.
   * Coordinates are clamped to the texture boundaries.
   * 
   * @param name - Name of the texture
   * @param x - X coordinate in the texture
   * @param y - Y coordinate in the texture
   * @returns RGB color string (e.g., "rgb(255, 0, 0)") or white if texture not found
   */
  getTextureColor(name: string, x: number, y: number): string {
    const textureData = this.textureData.get(name);
    if (!textureData) return "#ffffff";

    x = Math.max(0, Math.min(x, textureData.width - 1));
    y = Math.max(0, Math.min(y, textureData.height - 1));

    const index = (y * textureData.width + x) * 4;
    const r = textureData.data[index];
    const g = textureData.data[index + 1];
    const b = textureData.data[index + 2];

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Alias for getTextureColor for backward compatibility.
   * 
   * @param name - Name of the texture
   * @param x - X coordinate in the texture
   * @param y - Y coordinate in the texture
   * @returns RGB color string
   */
  getTextureColorByName(name: string, x: number, y: number): string {
    return this.getTextureColor(name, x, y);
  }
} 