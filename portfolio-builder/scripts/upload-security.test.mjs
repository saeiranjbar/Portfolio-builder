import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const dependency = createRequire(import.meta.url);
function setup(session = { user: { email: 'owner@example.com' } }, env = 'production') {
  const uploaded = [];
  const testModule = { exports: {} };
  const source = fs.readFileSync(path.join(root, 'app/api/upload/route.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(compiled, {
    module: testModule, exports: testModule.exports, Uint8Array, Response, process: { env: { NODE_ENV: env } }, console: { error() {} },
    require(name) {
      if (name === 'next-auth') return { getServerSession: async () => session };
      if (name === '@/lib/auth') return { authOptions: {} };
      if (name === '@/lib/local-uploads') return { isLocalUploadEnabled: () => env !== 'production', saveLocalUpload: async () => { throw new Error('local storage must be off in production'); } };
      if (name === '@vercel/blob') return { put: async (key, file, options) => { uploaded.push({ key, file, options }); return { url: 'https://media.example/file' }; } };
      return dependency(name);
    },
  });
  return { handler: testModule.exports.POST, uploaded };
}
const request = file => ({ formData: async () => ({ get: () => file }) });

test('uploads require an authenticated production session', async () => {
  const { handler, uploaded } = setup(null);
  assert.equal((await handler(request(new Blob(['test'], { type: 'image/png' })))).status, 401);
  assert.equal(uploaded.length, 0);
});

test('development uploads also require a signed-in session (F13)', async () => {
  const { handler, uploaded } = setup(null, 'development');
  assert.equal((await handler(request(new Blob(['test'], { type: 'image/png' })))).status, 401);
  assert.equal(uploaded.length, 0);
});

test('SVG and spoofed file signatures are rejected before storage', async () => {
  const { handler, uploaded } = setup();
  assert.equal((await handler(request(new Blob(['<svg/>'], { type: 'image/svg+xml' })))).status, 400);
  assert.equal((await handler(request(new Blob(['not a PNG'], { type: 'image/png' })))).status, 400);
  assert.equal(uploaded.length, 0);
});

test('valid image and PDF headers receive a canonical safe extension', async () => {
  const { handler, uploaded } = setup();
  const png = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' });
  assert.equal((await handler(request(png))).status, 200);
  assert.match(uploaded[0].key, /^uploads\/[0-9a-f-]+\.png$/);
  assert.equal((await handler(request(new Blob(['%PDF-1.4'], { type: 'application/pdf' })))).status, 200);
  assert.match(uploaded[1].key, /^uploads\/[0-9a-f-]+\.pdf$/);
});
