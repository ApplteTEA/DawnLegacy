'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'bootstrap.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function between(startText, endText) {
  const start = game.indexOf(startText);
  const end = game.indexOf(endText, start);
  assert.ok(start >= 0 && end > start, 'Expected game source section: ' + startText);
  return game.slice(start, end);
}

// Regression: removing a save on reset must not be undone by beforeunload(save).
{
  const store = new Map();
  const buttons = new Map();
  let reloadCount = 0;
  let dialog = '';
  const context = {
    localStorage: {
      setItem(key, value) { store.set(key, value); },
      getItem(key) { return store.get(key) ?? null; },
      removeItem(key) { store.delete(key); }
    },
    location: { reload() { reloadCount++; } },
    pop(content, onShow) { dialog = content; buttons.clear(); if (onShow) onShow(); },
    btn(id, callback) { buttons.set(id, callback); },
    toast() {},
    close() {},
    party() {}, box() {}, bag() {}, dex() {}, guide() {}, record() {}
  };

  const code = `
    const SAVE='dawnLegacyCompleteV2';
    let s={type:'불꽃',badges:0,champion:false,party:[]};
    let resetInProgress=false,mode='world';
    ${between('function save(){', 'function rand(n)')}
    ${between('function menu(){', 'function party(){')}
    this.api={save,menu};
  `;
  vm.runInNewContext(code, context);

  context.api.save();
  assert.ok(store.has('dawnLegacyCompleteV2'), 'Normal saving must work');

  context.api.menu();
  assert.equal(typeof buttons.get('restart'), 'function', 'New Game must be available in menu');
  buttons.get('restart')();
  assert.match(dialog, /새 게임을 시작할까/);
  assert.equal(typeof buttons.get('yes'), 'function', 'Restart confirmation button must work');
  buttons.get('yes')();
  assert.equal(reloadCount, 1, 'New game must reload once');
  assert.equal(store.has('dawnLegacyCompleteV2'), false, 'New game must remove old save');

  context.api.save(); // Represents the existing beforeunload or visibilitychange handler.
  assert.equal(store.has('dawnLegacyCompleteV2'), false, 'Unload must not resurrect a deleted save');
}

// Regression: cached bootstrap previously requested an older game.js despite updated index.html.
{
  const version = bootstrap.match(/const version='([^']+)'/);
  assert.ok(version, 'Bootstrap asset version must exist');
  assert.match(bootstrap, /'game\.js'/);
  assert.ok(html.includes('bootstrap.js?v=' + version[1]), 'Index must load current bootstrap');
  assert.ok(html.includes('rival-system.js?v=' + version[1]), 'Rival module must use current cache revision');
}

// Rival label must be drawn in the world relative to the current camera/actor coordinates.
{
  const labels = [];
  const context = {
    ctx: {
      save() {}, restore() {},
      fillRect() {}, fillText(text, x, y) { labels.push({ text, x, y }); },
      measureText(value) { return { width: value.length * 10 }; }
    },
    canvas: { width: 320, height: 260 },
    s: { type: '불꽃', x: 8, y: 12 },
    NPCS: [{ x: 10, y: 12, name: '시온', type: 'rival' }],
    WORLD_V2: { draw() {} },
    FIELD_MANIFEST: { tileSize: 24 },
    FIELD_ACTORS: { sample(s) { return { player: { x: s.x, y: s.y } }; } },
    isGrass() { return false; }
  };
  vm.runInNewContext(between('function draw(){', 'let lastFrame=0;'), context);
  context.draw();
  assert.equal(labels.length, 1);
  assert.equal(labels[0].text, '라이벌 시온');
  assert.ok(labels[0].x > 160 && labels[0].x < 240, 'Rival label must be to the right of spawn');
  context.s.x = 80;
  context.draw();
  assert.equal(labels.length, 1, 'An offscreen rival must not be labeled over the field');
}

console.log('New game reset, cache revision and rival location marker regression tests passed.');
