import { Map } from "../engine/Map";

/**
 * Represents the player entity in the game.
 * Handles player movement, controls, collision detection, and camera controls.
 * 
 * @example
 * ```typescript
 * const player = new Player(100, 100, {
 *   mouseSensitivity: 0.002,
 *   sprintSpeed: 8,
 *   baseSpeed: 5
 * });
 * player.setMap(gameMap);
 * ```
 */
export class Player {
  /** Current X position in the game world */
  x: number;
  /** Current Y position in the game world */
  y: number;
  /** Current viewing angle in radians */
  angle: number;
  /** Current movement speed */
  speed: number;
  /** Base movement speed when walking */
  private baseSpeed: number = 6.5;
  /** Movement speed when sprinting */
  private sprintSpeed: number = 5;
  /** Mouse movement sensitivity for camera control */
  private mouseSensitivity: number = 0.002;
  /** Vertical jump speed */
  private jumpSpeed: number = 10;
  /** Gravity force applied to vertical movement */
  private gravity: number = 0.1;
  /** Size of a tile in the game world */
  private readonly TILE_SIZE: number = 64;
  /** Margin used for collision detection */
  private readonly COLLISION_MARGIN: number = 3;
  /** Reference to the current game map */
  private map: Map | null = null;

  /**
   * Creates a new Player instance.
   * 
   * @param x - Initial X position
   * @param y - Initial Y position
   * @param options - Configuration options for the player
   * @param options.mouseSensitivity - Mouse movement sensitivity (default: 0.002)
   * @param options.sprintSpeed - Movement speed when sprinting (default: 5)
   * @param options.baseSpeed - Base movement speed (default: 6.5)
   * @param options.jumpSpeed - Vertical jump speed (default: 10)
   * @param options.gravity - Gravity force (default: 0.1)
   */
  constructor(x: number, y: number, options: {
    mouseSensitivity?: number;
    sprintSpeed?: number;
    baseSpeed?: number;
    jumpSpeed?: number;
    gravity?: number;
  }) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = this.baseSpeed;
    this.mouseSensitivity = options.mouseSensitivity ?? this.mouseSensitivity;
    this.baseSpeed = options.baseSpeed ?? this.baseSpeed;
    this.sprintSpeed = options.sprintSpeed ?? this.sprintSpeed;
    this.jumpSpeed = options.jumpSpeed ?? this.jumpSpeed;
    this.gravity = options.gravity ?? this.gravity;
    this.setupControls();
    this.setupMouseControls();
  }

  /**
   * Sets the current game map for collision detection.
   * 
   * @param map - The game map instance
   */
  setMap(map: Map) {
    this.map = map;
  }

  /**
   * Sets up keyboard controls for player movement.
   * Handles WASD/Arrow keys for movement and rotation.
   * Shift key for sprinting.
   */
  private setupControls() {
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyA":
        case "ArrowLeft":
          this.angle -= 0.1;
          break;
        case "KeyD":
        case "ArrowRight":
          this.angle += 0.1;
          break;
        case "KeyW":
        case "ArrowUp":
          this.moveForward();
          break;
        case "KeyS":
        case "ArrowDown":
          this.moveBackward();
          break;
        case "ShiftLeft":
        case "ShiftRight":
          this.speed = this.sprintSpeed;
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        this.speed = this.baseSpeed;
      }
    });
  }

  /**
   * Sets up mouse controls for camera rotation.
   * Uses pointer lock API for smooth camera control.
   */
  private setupMouseControls() {
    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === document.body) {
        this.angle += e.movementX * this.mouseSensitivity;
      }
    });

    document.addEventListener("click", () => {
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
      }
    });
  }

  /**
   * Moves the player forward based on current angle and speed.
   * Checks for collisions before applying movement.
   */
  private moveForward() {
    const newX = this.x + Math.cos(this.angle) * this.speed;
    const newY = this.y + Math.sin(this.angle) * this.speed;

    if (this.canMoveTo(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
  }

  /**
   * Moves the player backward based on current angle and speed.
   * Checks for collisions before applying movement.
   */
  private moveBackward() {
    const newX = this.x - Math.cos(this.angle) * this.speed;
    const newY = this.y - Math.sin(this.angle) * this.speed;

    if (this.canMoveTo(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
  }

  /**
   * Checks if the player can move to a new position.
   * Performs collision detection using the player's collision margin.
   * 
   * @param newX - Target X position
   * @param newY - Target Y position
   * @returns True if the player can move to the new position, false otherwise
   */
  private canMoveTo(newX: number, newY: number): boolean {
    if (!this.map) return false;

    const corners = [
      { x: newX - this.COLLISION_MARGIN, y: newY - this.COLLISION_MARGIN },
      { x: newX + this.COLLISION_MARGIN, y: newY - this.COLLISION_MARGIN },
      { x: newX - this.COLLISION_MARGIN, y: newY + this.COLLISION_MARGIN },
      { x: newX + this.COLLISION_MARGIN, y: newY + this.COLLISION_MARGIN }
    ];

    return !corners.some(corner => {
      const tileX = Math.floor(corner.x / this.TILE_SIZE);
      const tileY = Math.floor(corner.y / this.TILE_SIZE);
      return this.map!.isSolid(tileX, tileY);
    });
  }
} 