import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import prismaPackage from '@prisma/client';

const { Prisma } = prismaPackage;
const loadDependency = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));

const ownerId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const ownPortfolioId = '33333333-3333-4333-8333-333333333333';
const otherPortfolioId = '44444444-4444-4444-8444-444444444444';
const draft = {
  sections: [{ id: 'hero', type: 'hero', title: 'My work' }],
  theme: { colors: { primary: '#123456' } },
  layoutMode: 'simple',
};

// Execute the actual handlers with an isolated database and session.
// These tests never connect to Neon or depend on local credentials.
function loadRoute(route = 'app/api/portfolio/route.ts', options = {}) {
  const records = [
    { id: ownPortfolioId, userId: ownerId, title: 'Mine', data: '{}' },
    { id: otherPortfolioId, userId: otherId, title: 'Other user', data: '{}' },
  ];
  const calls = [];
  const session = 'session' in options
    ? options.session
    : { user: { email: 'owner@example.com' } };
  const missingRecord = () => new Prisma.PrismaClientKnownRequestError(
    'Record not found', { code: 'P2025', clientVersion: '5.22.0' }
  );
  const findIndex = (where) => records.findIndex(
    (record) => record.id === where.id && record.userId === where.userId
  );
  const prisma = {
    user: {
      async findUnique(args) {
        calls.push(['user', args]);
        if (options.databaseError) throw new Error('Internal connection details');
        return options.missingUser ? null : { id: ownerId };
      },
    },
    portfolio: {
      async findMany(args) {
        calls.push(['list', args]);
        return records.filter((record) => record.userId === args.where.userId);
      },
      async create(args) {
        calls.push(['create', args]);
        const record = { id: '55555555-5555-4555-8555-555555555555', ...args.data };
        records.push(record);
        return record;
      },
      async update(args) {
        calls.push(['update', args]);
        const index = findIndex(args.where);
        if (index < 0) throw missingRecord();
        records[index] = { ...records[index], ...args.data };
        return records[index];
      },
      async delete(args) {
        calls.push(['delete', args]);
        const index = findIndex(args.where);
        if (index < 0) throw missingRecord();
        return records.splice(index, 1)[0];
      },
    },
  };
  const testModule = { exports: {} };
  const source = fs.readFileSync(path.join(projectRoot, route), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(compiled, {
    module: testModule, exports: testModule.exports, Response,
    console: { error() {} },
    require(name) {
      if (name === 'next-auth') return { getServerSession: async () => session };
      if (name === '@/lib/auth') return { authOptions: {} };
      if (name === '@/lib/prisma') return { prisma };
      return loadDependency(name);
    },
  }, { filename: route });
  return { handlers: testModule.exports, records, calls };
}

function request(body, id) {
  const nextUrl = new URL('http://localhost:3000/api/portfolio');
  if (id !== undefined) nextUrl.searchParams.set('id', id);
  return { nextUrl, json: async () => body };
}

for (const method of ['GET', 'POST', 'DELETE']) {
  test(`${method} rejects signed-out requests before accessing the database`, async () => {
    const { handlers, calls } = loadRoute(undefined, { session: null });
    const response = await handlers[method](request({}, ownPortfolioId));
    assert.equal(response.status, 401);
    assert.equal(calls.length, 0);
  });
}

test('a session without an existing database user is rejected', async () => {
  const { handlers, calls } = loadRoute(undefined, { missingUser: true });
  assert.equal((await handlers.GET()).status, 401);
  assert.equal(calls.filter(([operation]) => operation !== 'user').length, 0);
});

test('GET returns only the signed-in owner\'s portfolios', async () => {
  const { handlers } = loadRoute();
  const response = await handlers.GET();
  assert.equal(response.status, 200);
  const { portfolios } = await response.json();
  assert.deepEqual(portfolios.map((record) => record.id), [ownPortfolioId]);
});

test('POST creates with the authenticated owner and preserves portfolio JSON', async () => {
  const { handlers } = loadRoute();
  const response = await handlers.POST(request({
    title: '  My portfolio  ', data: draft, userId: otherId,
  }));
  assert.equal(response.status, 201);
  const { portfolio } = await response.json();
  assert.equal(portfolio.userId, ownerId);
  assert.equal(portfolio.title, 'My portfolio');
  assert.ok(portfolio.id);
  assert.deepEqual(JSON.parse(portfolio.data), draft);
});

test('POST updates an owned portfolio without creating a duplicate', async () => {
  const { handlers, records } = loadRoute();
  const response = await handlers.POST(request({
    id: ownPortfolioId, title: 'Updated', data: draft,
  }));
  assert.equal(response.status, 200);
  const { portfolio } = await response.json();
  assert.equal(portfolio.id, ownPortfolioId);
  assert.equal(portfolio.title, 'Updated');
  assert.equal(records.length, 2);
});

for (const id of [otherPortfolioId, '66666666-6666-4666-8666-666666666666']) {
  test(`POST cannot overwrite or create a portfolio using inaccessible ID ${id}`, async () => {
    const { handlers, records } = loadRoute();
    const before = JSON.stringify(records);
    const response = await handlers.POST(request({ id, title: 'Overwrite', data: draft }));
    assert.equal(response.status, 404);
    assert.equal(JSON.stringify(records), before);
  });
}

test('invalid save payloads and malformed JSON return 400 without writing', async () => {
  const { handlers, calls } = loadRoute();
  for (const body of [null, {}, { title: '', data: draft },
    { title: 'Work', data: 'a string' },
    { title: 'Work', data: { sections: [], theme: null } },
    { title: 'Work', data: draft, id: 'not-a-uuid' }]) {
    assert.equal((await handlers.POST(request(body))).status, 400);
  }
  const malformed = request(null);
  malformed.json = async () => { throw new SyntaxError('Invalid JSON'); };
  assert.equal((await handlers.POST(malformed)).status, 400);
  assert.equal(calls.filter(([operation]) => ['create', 'update'].includes(operation)).length, 0);
});

test('DELETE removes an owned portfolio', async () => {
  const { handlers, records } = loadRoute();
  const response = await handlers.DELETE(request(null, ownPortfolioId));
  assert.equal(response.status, 200);
  assert.equal(records.some((record) => record.id === ownPortfolioId), false);
  assert.equal(records.some((record) => record.id === otherPortfolioId), true);
});

test('DELETE cannot remove another user\'s portfolio', async () => {
  const { handlers, records } = loadRoute();
  const before = JSON.stringify(records);
  assert.equal((await handlers.DELETE(request(null, otherPortfolioId))).status, 404);
  assert.equal(JSON.stringify(records), before);
});

test('DELETE rejects missing or invalid IDs', async () => {
  const { handlers, calls } = loadRoute();
  for (const id of [undefined, '', 'invalid']) {
    assert.equal((await handlers.DELETE(request(null, id))).status, 400);
  }
  assert.equal(calls.filter(([operation]) => operation === 'delete').length, 0);
});

test('database failures return a generic error without exposing connection details', async () => {
  const { handlers } = loadRoute(undefined, { databaseError: true });
  const response = await handlers.GET();
  assert.equal(response.status, 500);
  assert.equal((await response.json()).error, 'Unable to complete the request');
});

for (const route of ['app/api/portfolios/route.ts', 'app/api/portfolios/[id]/route.ts',
  'app/api/projects/route.ts', 'app/api/projects/[id]/route.ts']) {
  test(`${route} is closed for every previously supported method`, async () => {
    const { handlers, calls } = loadRoute(route);
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      if (handlers[method]) assert.equal((await handlers[method]()).status, 410);
    }
    assert.equal(calls.length, 0);
  });
}
