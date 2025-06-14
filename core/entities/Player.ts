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
  private baseSpeed: number = 10;
  /** Movement speed when sprinting */
  private sprintSpeed: number = 30;
  /** Mouse movement sensitivity for camera control */
  private mouseSensitivity: number = 0.002;
  /** Vertical jump speed */
  private jumpSpeed: number = 10;
  /** Gravity force applied to vertical movement */
  private gravity: number = 0.1;
  /** Size of a tile in the game world */
  private readonly TILE_SIZE: number = 64;
  /** Margin used for collision detection */
  private COLLISION_MARGIN: number = 3;
  /** Reference to the current game map */
  private map: Map | null = null;
  /** Set of currently pressed keys */
  private pressedKeys: Set<string> = new Set();

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
    collisionMargin?: number;
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
    this.COLLISION_MARGIN = options.collisionMargin ?? this.COLLISION_MARGIN;
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
      this.pressedKeys.add(e.code);
    });

    document.addEventListener("keyup", (e) => {
      this.pressedKeys.delete(e.code);
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        this.speed = this.baseSpeed;
      }
    });

    // Game loop for movement
    setInterval(() => {
      if (this.pressedKeys.has("KeyW") || this.pressedKeys.has("ArrowUp")) {
        this.moveForward();
      }
      if (this.pressedKeys.has("KeyS") || this.pressedKeys.has("ArrowDown")) {
        this.moveBackward();
      }
      if (this.pressedKeys.has("KeyA") || this.pressedKeys.has("ArrowLeft")) {
        this.angle -= 0.1;
      }
      if (this.pressedKeys.has("KeyD") || this.pressedKeys.has("ArrowRight")) {
        this.angle += 0.1;
      }
      if (this.pressedKeys.has("ShiftLeft") || this.pressedKeys.has("ShiftRight")) {
        this.speed = this.sprintSpeed;
      }
    }, 16); // ~60 FPS
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

    const margin = this.COLLISION_MARGIN;
    const angle = this.angle;

    const frontPoints = [
      { x: newX + Math.cos(angle) * margin, y: newY + Math.sin(angle) * margin },
      { x: newX + Math.cos(angle + Math.PI / 4) * margin, y: newY + Math.sin(angle + Math.PI / 4) * margin },
      { x: newX + Math.cos(angle - Math.PI / 4) * margin, y: newY + Math.sin(angle - Math.PI / 4) * margin }
    ];

    const sidePoints = [
      { x: newX + Math.cos(angle + Math.PI / 2) * margin, y: newY + Math.sin(angle + Math.PI / 2) * margin },
      { x: newX + Math.cos(angle - Math.PI / 2) * margin, y: newY + Math.sin(angle - Math.PI / 2) * margin }
    ];

    const checkCollision = (point: { x: number, y: number }) => {
      const tileX = Math.floor(point.x / this.TILE_SIZE);
      const tileY = Math.floor(point.y / this.TILE_SIZE);
      return this.map!.isSolid(tileX, tileY);
    };

    if (frontPoints.some(checkCollision)) {
      return false;
    }

    const leftCollision = checkCollision(sidePoints[0]!);
    const rightCollision = checkCollision(sidePoints[1]!);

    if (leftCollision && rightCollision) {
      return false;
    }

    return true;
  }
} 