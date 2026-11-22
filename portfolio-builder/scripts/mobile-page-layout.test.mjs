import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../lib/mobile-page-layout.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports });
const order = module.exports.orderMobileTiles;

test('mobile order follows desktop top to bottom, then left to right, without changing saved positions', () => {
  const items = [{ id: 'bottom', x: 0, y: 200 }, { id: 'right', x: 50, y: 20 }, { id: 'left', x: 5, y: 20 }, { id: 'new' }];
  const before = JSON.stringify(items);
  assert.deepEqual(Array.from(order(items, item => item.y === undefined ? undefined : item), item => item.id), ['left', 'right', 'bottom', 'new']);
  assert.equal(JSON.stringify(items), before);
});
