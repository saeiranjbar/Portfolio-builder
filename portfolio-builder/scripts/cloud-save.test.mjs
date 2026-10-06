import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const loadDependency = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const ownerEmail = 'owner@example.com';
const savedId = '33333333-3333-4333-8333-333333333333';
const reference = { id: savedId, ownerEmail };

function setup() {
  const cache = new Map();
  function loadFile(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const testModule = { exports: {} };
    cache.set(filename, testModule);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(compiled, {
      module: testModule, exports: testModule.exports, Response, fetch,
      console: { warn() {}, error() {} },
      require(name) {
        if (name.startsWith('.')) {
          return loadFile(path.resolve(path.dirname(filename), `${name}.ts`));
        }
        return loadDependency(name);
      },
    }, { filename });
    return testModule.exports;
  }
  const { usePortfolioStore: store } = loadFile(path.join(projectRoot, 'lib/store.ts'));
  const { savePortfolioToCloud, CloudSaveError } = loadFile(path.join(projectRoot, 'lib/cloud-save.ts'));
  const { listSavedWebsites, parseSavedWebsite } = loadFile(path.join(projectRoot, 'lib/cloud-load.ts'));
  return { store, savePortfolioToCloud, CloudSaveError, listSavedWebsites, parseSavedWebsite };
}

const confirmed = () => Response.json({ portfolio: { id: savedId } }, { status: 201 });

function savedRecord(snapshot) {
  return {
    id: savedId, title: 'Saved website', updatedAt: '2026-10-05T22:00:00.000Z',
    data: JSON.stringify({ ...snapshot.portfolio, pages: snapshot.pages, currentPageId: snapshot.currentPageId }),
  };
}

test('saved website list is fetched with session cookies and no cache', async () => {
  const { store, listSavedWebsites } = setup();
  const record = savedRecord(store.getState());
  const controller = new AbortController();
  const records = await listSavedWebsites(controller.signal, async (url, options) => {
    assert.equal(url, '/api/portfolio');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.signal, controller.signal);
    return Response.json({ portfolios: [record] });
  });
  assert.equal(records[0].id, savedId);
});

test('list failures and malformed records are rejected without changing the draft', async () => {
  const { store, listSavedWebsites } = setup();
  const original = store.getState().portfolio;
  for (const response of [new Response('', { status: 401 }), new Response('', { status: 500 }),
    Response.json({ portfolios: [{ id: 'invalid' }] }), new Response('not JSON')]) {
    await assert.rejects(listSavedWebsites(undefined, async () => response));
    assert.equal(store.getState().portfolio, original);
  }
});

test('opening a multi-page website restores content and updates the existing database row on its next save', async () => {
  const { store, parseSavedWebsite, savePortfolioToCloud } = setup();
  store.getState().updateSection(store.getState().portfolio.sections[0].id, { name: 'Saved name' });
  store.getState().addPage('About');
  const activeId = store.getState().portfolio.sections[0].id;
  store.getState().updateSection(activeId, { title: 'Latest page edits', textStyles: { title: { animationType: 'wordColorReveal' } } });
  const original = store.getState();
  const record = savedRecord(original);
  store.getState().createBlankFlexibleSite();
  const oldVersion = store.getState().draftVersion;
  store.getState().loadCloudPortfolio(parseSavedWebsite(record, ownerEmail));
  const loaded = store.getState();
  assert.equal(loaded.pages.length, 2);
  assert.equal(loaded.currentPageId, original.currentPageId);
  assert.equal(loaded.portfolio.sections[0].title, 'Latest page edits');
  assert.equal(loaded.portfolio.sections[0].textStyles.title.animationType, 'wordColorReveal');
  assert.equal(loaded.pages.find(page => page.id === loaded.currentPageId).sections[0].title, 'Latest page edits');
  assert.equal(loaded.cloudPortfolio.id, savedId);
  assert.equal(loaded.isDirty, false);
  assert.equal(loaded.past.length, 0);
  assert.equal(loaded.future.length, 0);
  assert.equal(loaded.draftVersion, oldVersion + 1);
  store.getState().updateSection(activeId, { title: 'Edit after opening' });
  await savePortfolioToCloud(store.getState(), store.getState().cloudPortfolio, ownerEmail, async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.id, savedId);
    assert.equal(body.data.sections[0].title, 'Edit after opening');
    return confirmed();
  });
});

test('legacy single-page saved data loads with a home page', () => {
  const { store, parseSavedWebsite } = setup();
  const record = savedRecord(store.getState());
  record.data = JSON.stringify(store.getState().portfolio);
  const loaded = parseSavedWebsite(record, ownerEmail);
  assert.equal(loaded.currentPageId, 'home');
  assert.equal(loaded.pages.length, 1);
});

test('invalid saved content is rejected before replacing the current draft', () => {
  const { store, parseSavedWebsite } = setup();
  const original = store.getState().portfolio;
  const record = savedRecord(store.getState());
  const data = JSON.parse(record.data);
  for (const invalid of ['not JSON', '{}', JSON.stringify({ ...data, currentPageId: 'missing' }),
    JSON.stringify({ ...data, pages: [...data.pages, data.pages[0]] }),
    JSON.stringify({ ...data, theme: {} })]) {
    assert.throws(() => parseSavedWebsite({ ...record, data: invalid }, ownerEmail));
    assert.equal(store.getState().portfolio, original);
  }
});

test('first save posts the current draft and all pages without using the local ID as a database ID', async () => {
  const { store, savePortfolioToCloud } = setup();
  store.getState().addPage('About');
  const activeSection = store.getState().portfolio.sections[0];
  store.getState().updateSection(activeSection.id, { title: 'Fresh active-page edits' });
  const snapshot = store.getState();
  let sent;
  const result = await savePortfolioToCloud(snapshot, null, ownerEmail, async (url, options) => {
    assert.equal(url, '/api/portfolio');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.headers['Content-Type'], 'application/json');
    sent = JSON.parse(options.body);
    return confirmed();
  });
  assert.equal('id' in sent, false);
  assert.equal(sent.data.id, snapshot.portfolio.id);
  assert.equal(sent.data.pages.length, 2);
  assert.equal(sent.data.currentPageId, snapshot.currentPageId);
  assert.equal(sent.data.pages.find((page) => page.id === snapshot.currentPageId).sections[0].title,
    'Fresh active-page edits');
  assert.equal(result.id, savedId);
  assert.equal(result.ownerEmail, ownerEmail);
});

test('later saves include the database ID only for its owning account', async () => {
  const { store, savePortfolioToCloud } = setup();
  for (const email of [ownerEmail, 'another@example.com']) {
    await savePortfolioToCloud(store.getState(), reference, email, async (_url, options) => {
      const body = JSON.parse(options.body);
      assert.equal(body.id, email === ownerEmail ? savedId : undefined);
      return confirmed();
    });
  }
});

test('empty metadata titles fall back to the draft name', async () => {
  const { store, savePortfolioToCloud } = setup();
  const snapshot = store.getState();
  snapshot.portfolio = {
    ...snapshot.portfolio, name: 'My work',
    metadata: { ...snapshot.portfolio.metadata, title: '   ' },
  };
  await savePortfolioToCloud(snapshot, null, ownerEmail, async (_url, options) => {
    assert.equal(JSON.parse(options.body).title, 'My work');
    return confirmed();
  });
});

for (const status of [401, 404, 500]) {
  test(`HTTP ${status} rejects the save and leaves the local draft dirty`, async () => {
    const { store, savePortfolioToCloud, CloudSaveError } = setup();
    store.getState().updateMetadata({ title: 'Unsaved work' });
    await assert.rejects(
      savePortfolioToCloud(store.getState(), null, ownerEmail,
        async () => Response.json({ error: 'Save failed' }, { status })),
      (error) => error instanceof CloudSaveError && error.status === status && error.message === 'Save failed',
    );
    assert.equal(store.getState().isDirty, true);
    assert.equal(store.getState().cloudPortfolio, null);
  });
}

test('network errors do not mark the draft saved', async () => {
  const { store, savePortfolioToCloud } = setup();
  store.getState().updateMetadata({ title: 'Unsaved work' });
  await assert.rejects(savePortfolioToCloud(store.getState(), null, ownerEmail,
    async () => { throw new TypeError('Network unavailable'); }));
  assert.equal(store.getState().isDirty, true);
  assert.equal(store.getState().cloudPortfolio, null);
});

test('non-JSON responses and unconfirmed successes reject the save', async () => {
  const { store, savePortfolioToCloud, CloudSaveError } = setup();
  for (const response of [new Response('Bad gateway', { status: 502 }),
    Response.json({ portfolio: {} }), Response.json({ portfolio: { id: 'invalid' } })]) {
    await assert.rejects(savePortfolioToCloud(store.getState(), null, ownerEmail,
      async () => response), (error) => error instanceof CloudSaveError);
  }
});

test('confirmed saves retain the database ID and clear only the saved draft\'s dirty flag', () => {
  const { store } = setup();
  store.getState().updateMetadata({ title: 'Save me' });
  const snapshot = store.getState();
  store.getState().completeCloudSave(snapshot, reference);
  assert.equal(store.getState().isDirty, false);
  assert.equal(store.getState().cloudPortfolio.id, savedId);
  const persisted = store.persist.getOptions().partialize(store.getState());
  assert.equal(persisted.cloudPortfolio.id, savedId);
  assert.equal(persisted.cloudPortfolio.ownerEmail, ownerEmail);
  assert.equal(persisted.isDirty, false);
});

test('edits made during a request remain dirty and the next save updates the same record', async () => {
  const { store, savePortfolioToCloud } = setup();
  let finish;
  const snapshot = store.getState();
  const pending = savePortfolioToCloud(snapshot, null, ownerEmail,
    () => new Promise((resolve) => { finish = resolve; }));
  store.getState().updateMetadata({ title: 'Newer edit' });
  finish(confirmed());
  store.getState().completeCloudSave(snapshot, await pending);
  assert.equal(store.getState().isDirty, true);
  assert.equal(store.getState().cloudPortfolio.id, savedId);
  const newer = store.getState();
  const saved = await savePortfolioToCloud(newer, newer.cloudPortfolio, ownerEmail, async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.id, savedId);
    assert.equal(body.title, 'Newer edit');
    return confirmed();
  });
  store.getState().completeCloudSave(newer, saved);
  assert.equal(store.getState().isDirty, false);
});

test('page metadata edits during saving remain dirty', () => {
  const { store } = setup();
  const snapshot = store.getState();
  store.getState().updatePageMeta(snapshot.currentPageId, { title: 'New page name' });
  store.getState().completeCloudSave(snapshot, reference);
  assert.equal(store.getState().isDirty, true);
});

test('importing a draft with the same local ID discards an old in-flight save result', () => {
  const { store } = setup();
  const snapshot = store.getState();
  store.getState().setPortfolio(snapshot.portfolio);
  store.getState().completeCloudSave(snapshot, reference);
  assert.equal(store.getState().cloudPortfolio, null);
  assert.equal(store.getState().isDirty, true);
});

for (const action of ['resetPortfolio', 'createBlankFlexibleSite']) {
  test(`${action} detaches the old cloud record`, () => {
    const { store } = setup();
    store.getState().completeCloudSave(store.getState(), reference);
    const snapshot = store.getState();
    store.getState()[action]();
    store.getState().completeCloudSave(snapshot, reference);
    assert.equal(store.getState().cloudPortfolio, null);
  });
}

test('unsaved edits and the cloud record ID are both persisted for refresh', () => {
  const { store } = setup();
  store.getState().completeCloudSave(store.getState(), reference);
  store.getState().updateMetadata({ title: 'Unsaved after cloud save' });
  const persisted = store.persist.getOptions().partialize(store.getState());
  assert.equal(persisted.cloudPortfolio.id, savedId);
  assert.equal(persisted.isDirty, true);
});
