import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');

let game;
try {
  game = new Game();
  window.game = game;
} catch(e) {
  console.error('Game constructor FAILED:', e);
}

if (game) {
  try {
    game.init(canvas);
  } catch(e) {
    console.error('INIT FAILED:', e);
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);color:#ff3333;z-index:99999;padding:20px;font:14px monospace;overflow:auto;white-space:pre-wrap;cursor:pointer';
    d.textContent = 'ERROR:\n' + e.message + '\n\n' + e.stack + '\n\n(click to dismiss)';
    d.addEventListener('click', () => d.remove());
    document.body.appendChild(d);
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (!game) return;
  try {
    game.update();
    game.render();
  } catch(e) {
  }
}

if (game) animate();
