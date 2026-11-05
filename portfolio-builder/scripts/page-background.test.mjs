import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));

// lib/page-background.ts is type-only on the project, so it transpiles cleanly
// and needs no module stubs.
function loadHelpers() {
  const filename = path.join(root, 'lib/page-background.ts');
  const module = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, console }, { filename });
  return module.exports;
}

const helpers = loadHelpers();
const scene = (id, extra = {}) => ({ id, type: 'video', value: `https://cdn.test/${id}.mp4`, ...extra });

test('hidden and empty scenes never paint', () => {
  const hero = {
    backgroundMode: 'sequence',
    backgroundScenes: [scene('a'), scene('hidden', { visible: false }), scene('blank', { value: '' }), scene('b')],
  };
  assert.deepEqual(helpers.getPageBackgroundScenes(hero).map((item) => item.id), ['a', 'b']);
  assert.equal(helpers.getPageBackgroundMode(hero), 'sequence');
});

test('the reel only runs with a sequence mode and at least two usable clips', () => {
  assert.equal(helpers.getPageBackgroundMode({ backgroundMode: 'single', backgroundScenes: [scene('a'), scene('b')] }), 'single');
  assert.equal(helpers.getPageBackgroundMode({ backgroundMode: 'sequence', backgroundScenes: [scene('a')] }), 'single');
  assert.equal(helpers.getPageBackgroundMode({ backgroundMode: 'sequence', backgroundScenes: [] }), 'single');
  assert.equal(helpers.getPageBackgroundMode(undefined), 'single');
});

test('scenes without an explicit start are spread evenly over the page', () => {
  const scenes = [scene('a'), scene('b'), scene('c')];
  assert.deepEqual(helpers.getSceneStartPcts(scenes).map((value) => Math.round(value)), [0, 33, 67]);
});

test('explicit starts are clamped and kept in ascending order', () => {
  const scenes = [scene('a', { startPercent: 40 }), scene('b', { startPercent: 12 }), scene('c', { startPercent: 99.8 })];
  assert.deepEqual(helpers.getSceneStartPcts(scenes), [40, 40, 99]);
});

test('the active scene is the last one that has already taken over', () => {
  const scenes = [scene('a'), scene('b'), scene('c')];
  assert.equal(helpers.resolveSceneIndex(0, scenes), 0);
  assert.equal(helpers.resolveSceneIndex(20, scenes), 0);
  assert.equal(helpers.resolveSceneIndex(34, scenes), 1);
  assert.equal(helpers.resolveSceneIndex(100, scenes), 2);
  assert.equal(helpers.resolveSceneIndex(50, []), -1);
});

test('timing defaults stay inside the range the editor can produce', () => {
  assert.equal(helpers.getPageBackgroundTransition(undefined), 900);
  assert.equal(helpers.getPageBackgroundTransition({ backgroundTransition: 99999 }), 4000);
  assert.equal(helpers.getPageBackgroundInterval({ backgroundInterval: 0 }), 1);
  assert.equal(helpers.getPageBackgroundInterval({ backgroundInterval: 12 }), 12);
});

test('a pinned switch point is an absolute Y in page pixels', () => {
  const scenes = [scene('a'), scene('b', { startY: 1200 }), scene('c')];
  // Clip b switches at exactly Y 1200; the others fall back to their share of the
  // scrollable height (3000px here): 0 and 2000.
  assert.deepEqual(helpers.getSceneStartPxList(scenes, 3000), [0, 1200, 2000]);
  assert.equal(helpers.hasExplicitStartPoints(scenes), false);
  assert.equal(helpers.hasExplicitStartPoints([scene('a', { startY: 0 }), scene('b', { startY: 900 })]), true);
});

test('switching happens when the viewport top reaches the pinned Y', () => {
  const scenes = [scene('a'), scene('b', { startY: 1200 }), scene('c', { startY: 2600 })];
  assert.equal(helpers.resolveSceneAtScroll(0, 3000, scenes), 0);
  assert.equal(helpers.resolveSceneAtScroll(1199, 3000, scenes), 0);
  assert.equal(helpers.resolveSceneAtScroll(1200, 3000, scenes), 1);
  assert.equal(helpers.resolveSceneAtScroll(2599, 3000, scenes), 1);
  assert.equal(helpers.resolveSceneAtScroll(2600, 3000, scenes), 2);
  assert.equal(helpers.resolveSceneAtScroll(9999, 3000, scenes), 2);
  assert.equal(helpers.resolveSceneAtScroll(10, 3000, []), -1);
});

test('switch points are kept in clip order and never overlap', () => {
  const scenes = [scene('a', { startY: 2000 }), scene('b', { startY: 400 }), scene('c', { startY: 1500 })];
  assert.deepEqual(helpers.getSceneStartPxList(scenes, 3000), [2000, 2000, 2000]);
  const mixed = [scene('a'), scene('b', { startY: 100 }), scene('c')];
  assert.deepEqual(helpers.getSceneStartPxList(mixed, 900), [0, 100, 600]);
});

