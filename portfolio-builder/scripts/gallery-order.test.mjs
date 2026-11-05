import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../lib/gallery-order.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports });
const group = module.exports.groupGalleryByRatio;
const ratios = items => Array.from(group(items, 2, item => item), Number);

test('keeps similar portrait images together when one image must be alone', () => {
  assert.deepEqual(ratios([1, 1.48, 1.5]), [1.48, 1.5, 1]);
});

test('groups full rows and retains original order with one column', () => {
  assert.deepEqual(ratios([1.5, 0.8, 1.48, 0.9]), [0.8, 0.9, 1.48, 1.5]);
  assert.deepEqual(Array.from(group([1.5, 0.8], 1, item => item)), [1.5, 0.8]);
});
