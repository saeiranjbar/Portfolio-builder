import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { renderToString } from 'react-dom/server';
import React from 'react';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const id = '33333333-3333-4333-8333-333333333333';
const foreign = '44444444-4444-4444-8444-444444444444';

function setup(session = { user: { email: 'owner@example.com' } }) {
  let record;
  let site = null;
  const revisions = [];
  const db = {
    user: { findUnique: async () => ({ id: 'owner' }) },
    portfolio: { findFirst: async ({ where }) => where.id === id && where.userId === 'owner' ? record : null },
    site: {
      findFirst: async ({ where }) => site && site.id === where.id && site.userId === where.userId ? site : null,
      findUnique: async ({ where }) => site?.slug === where.slug ? site : null,
      upsert: async ({ create, update }) => site = site ? { ...site, ...update } : { ...create, status: 'draft', publishedAt: null },
      update: async ({ data }) => site = { ...site, ...data },
      updateMany: async ({ where, data }) => {
        if (site?.id === where.id && site.userId === where.userId) site = { ...site, ...data };
      },
    },
    siteRevision: {
      create: async ({ data }) => { revisions.push({ ...data }); return data; },
      findFirst: async ({ where }) => revisions.find(item => item.siteId === where.siteId && item.source === where.source && +item.createdAt === +where.createdAt) ?? null,
    },
  };
  db.$transaction = async fn => fn(db);
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(compiled, {
      module, exports: module.exports, Response, fetch, console, process,
      require(name) {
        if (name === '@/lib/prisma') return { prisma: db };
        if (name === '@/lib/auth') return { authOptions: {} };
        if (name === 'next-auth') return { getServerSession: async () => session };
        if (name === 'next/server') return { NextResponse: { json: Response.json } };
        if (name.startsWith('@/')) return load(path.join(root, `${name.slice(2)}.ts`));
        if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`));
        return require(name);
      },
    }, { filename });
    return module.exports;
  }
  const storeModule = load(path.join(root, 'lib/store.ts'));
  const state = storeModule.usePortfolioStore.getState();
  record = { id, userId: 'owner', title: 'My website', updatedAt: new Date(),
    data: JSON.stringify({ ...state.portfolio, pages: state.pages, currentPageId: state.currentPageId }) };
  return {
    db, revisions, record, storeModule,
    api: load(path.join(root, 'app/api/publish/route.ts')),
    publishing: load(path.join(root, 'lib/publishing.ts')),
    sanitizer: load(path.join(root, 'lib/public-content.ts')),
    cloud: load(path.join(root, 'lib/cloud-publish.ts')),
  };
}

function request(method, websiteId = id, origin = 'https://builder.example') {
  const nextUrl = new URL(`https://builder.example/api/publish?id=${websiteId}`);
  return { nextUrl, headers: new Headers({ origin }), json: async () => ({ id: websiteId }), method };
}

test('publishing is owner-only and anonymous mutation is rejected', async () => {
  const anonymous = setup(null);
  assert.equal((await anonymous.api.POST(request('POST'))).status, 401);
  assert.equal(anonymous.revisions.length, 0);
  const owner = setup();
  for (const method of ['GET', 'POST', 'DELETE']) {
    assert.equal((await owner.api[method](request(method, foreign))).status, 404);
  }
  assert.equal(owner.revisions.length, 0);
});

test('publishing rejects cross-origin requests and malformed IDs', async () => {
  const { api } = setup();
  assert.equal((await api.POST(request('POST', id, 'https://other.example'))).status, 403);
  assert.equal((await api.POST(request('POST', 'bad-id'))).status, 400);
});

test('public reads use published snapshots, drafts remain private, and republishing keeps the URL', async () => {
  const { db, record, publishing, api } = setup();
  assert.equal(await publishing.readPublishedWebsite(db, 'missing'), null);
  const first = await (await api.POST(request('POST'))).json();
  assert.equal(first.published, true);
  const slug = first.path.split('/').at(-1);
  const live = await publishing.readPublishedWebsite(db, slug);
  const draft = JSON.parse(record.data);
  draft.metadata.title = 'New title';
  draft.pages.push({ ...draft.pages[0], id: 'about', slug: 'about', title: 'About', sections: [] });
  record.data = JSON.stringify(draft);
  record.title = 'Renamed website';
  assert.equal((await publishing.readPublishedWebsite(db, slug)).portfolio.metadata.title, live.portfolio.metadata.title);
  const second = await (await api.POST(request('POST'))).json();
  assert.equal(second.path, first.path);
  const updated = await publishing.readPublishedWebsite(db, slug);
  assert.equal(updated.portfolio.metadata.title, 'New title');
  assert.equal(updated.pages[1].slug, 'about');
  assert.equal('reference' in updated, false);
  assert.equal('userId' in updated, false);
  await api.DELETE(request('DELETE'));
  assert.equal(await publishing.readPublishedWebsite(db, slug), null);
});

test('ambiguous and unsafe page paths cannot be published', async () => {
  const { record, api, revisions } = setup();
  const draft = JSON.parse(record.data);
  draft.pages.push({ ...draft.pages[0], id: 'other' });
  record.data = JSON.stringify(draft);
  assert.equal((await api.POST(request('POST'))).status, 400);
  draft.pages[1].slug = '../private';
  record.data = JSON.stringify(draft);
  assert.equal((await api.POST(request('POST'))).status, 400);
  assert.equal(revisions.length, 0);
});

test('public rendering uses an isolated store and never changes the editor draft', () => {
  const { storeModule } = setup();
  const editor = storeModule.usePortfolioStore;
  const before = editor.getState();
  const publicData = { ...before.portfolio, name: 'Published', metadata: { ...before.portfolio.metadata, title: 'Public title' } };
  const publicStore = storeModule.createPublishedPortfolioStore(publicData, before.pages, before.currentPageId);
  function Title() { return React.createElement('span', null, storeModule.usePortfolioStore(s => s.portfolio.metadata.title)); }
  assert.equal(renderToString(React.createElement(storeModule.PortfolioStoreProvider, { store: publicStore }, React.createElement(Title))), '<span>Public title</span>');
  publicStore.getState().updateMetadata({ title: 'Unauthorized edit' });
  publicStore.getState().setPortfolio(before.portfolio);
  assert.equal(publicStore.getState().portfolio.metadata.title, 'Public title');
  assert.equal(publicStore.getState().previewMode, true);
  assert.equal(editor.getState(), before);
  assert.equal(renderToString(React.createElement(Title)), `<span>${before.portfolio.metadata.title}</span>`);
});

test('published rich text removes script execution while retaining safe formatting and embeds', () => {
  const { sanitizer } = setup();
  const original = { text: '<strong>Welcome</strong><img src="x" onerror="alert(1)"><script>alert(2)</script>',
    embedCode: '<iframe src="https://www.youtube.com/embed/example" onload="alert(3)"></iframe>',
    url: 'java\nscript:alert(4)', link: 'data:text/html,bad' };
  const clean = sanitizer.sanitizePublishedContent(original);
  assert.match(clean.text, /<strong>Welcome<\/strong>/);
  assert.doesNotMatch(clean.text, /script|onerror|alert/);
  assert.doesNotMatch(clean.embedCode, /onload/);
  assert.match(clean.embedCode, /sandbox="allow-scripts allow-presentation"/);
  assert.equal(clean.url, '');
  assert.equal(clean.link, '');
  assert.match(original.text, /onerror/);
});

test('cloud publication validates the server URL and includes session cookies', async () => {
  const { cloud } = setup();
  const result = await cloud.requestPublication(id, 'publish', undefined, async (url, options) => {
    assert.equal(url, '/api/publish');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(JSON.parse(options.body).id, id);
    return Response.json({ published: true, path: `/sites/website-${id}` });
  });
  assert.equal(result.published, true);
  await assert.rejects(cloud.requestPublication(id, 'status', undefined, async () => Response.json({ published: true, path: 'https://other.example' })));
});
