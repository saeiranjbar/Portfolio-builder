import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../lib/page-grid-rows.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports });
const place = module.exports.placePageGridRows;
const entry = (x, y, w, h, placed = true) => ({ item: { x, y: 0, w, h }, savedY: y, placed });

test('measured gallery and PDF heights push later rows down', () => {
  const rows = [entry(0, 0, 100, 40), entry(0, 40, 100, 600), entry(0, 200, 100, 700), entry(0, 300, 100, 50)];
  place(rows);
  assert.deepEqual(rows.map(row => row.item.y), [0, 40, 640, 1340]);
});

test('side by side tiles retain their positions and new tiles start below both', () => {
  const rows = [entry(0, 0, 40, 500), entry(60, 0, 40, 700), entry(20, 0, 60, 60, false)];
  place(rows);
  assert.deepEqual(rows.map(row => row.item.y), [0, 0, 700]);
});

test('height changes reflow saved rows on the next layout', () => {
  const rows = [entry(0, 0, 100, 100), entry(0, 100, 100, 100)];
  place(rows);
  rows[0].item.h = 800;
  place(rows);
  assert.equal(rows[1].item.y, 800);
});
test('dragging a tall PDF upward past a gallery midpoint inserts it before the gallery', () => {
  const rows = [
    { i: 'gallery', x: 0, y: 0, w: 100, h: 600 },
    { i: 'pdf', x: 0, y: 600, w: 100, h: 800 },
    { i: 'title', x: 0, y: 1400, w: 100, h: 50 },
  ];
  const result = module.exports.reorderPageGridDrop(rows, { ...rows[1], y: 290 });
  assert.deepEqual(Array.from(result, item => item.y), [800, 0, 1400]);
});

test('dragging downward across a midpoint inserts after the target', () => {
  const rows = [
    { i: 'pdf', x: 0, y: 0, w: 100, h: 800 },
    { i: 'gallery', x: 0, y: 800, w: 100, h: 600 },
  ];
  const result = module.exports.reorderPageGridDrop(rows, { ...rows[0], y: 301 });
  assert.deepEqual(Array.from(result, item => item.y), [600, 0]);
});

test('a drop before the midpoint does not reorder the rows', () => {
  const rows = [
    { i: 'gallery', x: 0, y: 0, w: 100, h: 600 },
    { i: 'pdf', x: 0, y: 600, w: 100, h: 800 },
  ];
  const result = module.exports.reorderPageGridDrop(rows, { ...rows[1], y: 350 });
  assert.deepEqual(Array.from(result, item => item.y), [0, 600]);
});