import { Level1 } from './levels/level_1'
import { Player } from "../../core/entities/Player";
import { Renderer } from "../../core/engine/Renderer";
import { MiniMap } from "../../core/ui/MiniMap";

const FPS = 30;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 192;
canvas.height = 108;

const level = new Level1();
const player = new Player(64 * 1.5, 64 * 1.5, {
  mouseSensitivity: 0.001,
  baseSpeed: 10,
  sprintSpeed: 20,
  jumpSpeed: 10,
});
player.setMap(level);
const renderer = new Renderer(canvas, {
});
const miniMap = new MiniMap();

let lastFrame = 0;
function gameLoop(now: number) {
  if (now - lastFrame > 1000 / FPS) {
    renderer.render(player, level);
    miniMap.render(canvas.getContext("2d")!, level, player);
    lastFrame = now;
  }
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);