import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { NextRequest } from 'next/server.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const dependency = createRequire(import.meta.url);
const password = 'a long secure password';

function setup(initialUsers = [], emailError = false) {
  let users = structuredClone(initialUsers);
  let challenges = new Map();
  const counters = new Map();
  const sent = [];
  const prisma = {
    authRateLimit: {
      deleteMany: async () => ({ count: 0 }),
      upsert: async ({ where, create }) => {
        const row = counters.get(where.id) ?? { ...create, count: 0 };
        row.count++; counters.set(where.id, row); return row;
      },
    },
    authChallenge: {
      upsert: async ({ where, create, update }) => {
        const row = challenges.has(where.id) ? { ...challenges.get(where.id), ...update } : create;
        challenges.set(where.id, row); return row;
      },
      deleteMany: async ({ where }) => {
        let count = 0;
        for (const [id, row] of challenges) {
          if (where.id && id !== where.id) continue;
          if (where.email && row.email !== where.email) continue;
          if (where.tokenHash && row.tokenHash !== where.tokenHash) continue;
          if (where.expiresAt?.gt && row.expiresAt <= where.expiresAt.gt) continue;
          if (where.expiresAt?.lt && row.expiresAt >= where.expiresAt.lt) continue;
          challenges.delete(id); count++;
        }
        return { count };
      },
    },
    user: {
      findMany: async ({ where, take }) => users.filter(user => user.email.toLowerCase() === where.email.equals.toLowerCase()).slice(0, take),
      create: async ({ data }) => { const user = { id: 'new-user', ...data }; users.push(user); return user; },
      update: async ({ where, data }) => {
        const user = users.find(user => user.id === where.id);
        const version = user.authVersion + data.authVersion.increment;
        Object.assign(user, data, { authVersion: version }); return user;
      },
    },
    $transaction: async callback => {
      const oldUsers = structuredClone(users), oldChallenges = structuredClone(challenges);
      try { return await callback(prisma); }
      catch (error) { users = oldUsers; challenges = oldChallenges; throw error; }
    },
  };
  const environment = { NEXTAUTH_SECRET: 'test-only-secret', RESEND_API_KEY: 'test-only-key', AUTH_FROM_EMAIL: 'sender@example.com' };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const testModule = { exports: {} }; cache.set(file, testModule);
    const compiled = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(compiled, {
      module: testModule, exports: testModule.exports, Buffer, Date, Response, process: { env: environment }, console: { error() {} },
      require(name) {
        if (name === './prisma') return { prisma };
        if (name === 'resend') return { Resend: class {
          emails = { send: async message => { sent.push(message); return emailError ? { error: { message: 'private provider failure' } } : { data: { id: 'email-id' } }; } };
        } };
        if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`);
        if (name.startsWith('.')) return load(path.join(path.dirname(file), `${name}.ts`));
        return dependency(name);
      },
    });
    return testModule.exports;
  }
  const security = load('lib/account-security.ts');
  return { ...security, passwords: load('lib/passwords.ts'), handlers: load('app/api/account/route.ts'), sent,
    environment, get users() { return users; }, get challenges() { return challenges; } };
}

function codeFrom(mail) { return mail.text.match(/code is: (\d{8})/)[1]; }
const requestInput = { email: 'owner@example.com', purpose: 'register' };

test('password hashes are salted and reject wrong, missing, and malformed passwords', async () => {
  const { passwords } = setup();
  const first = await passwords.hashPassword(password), second = await passwords.hashPassword(password);
  assert.notEqual(first, second);
  assert.doesNotMatch(first, /secure password/);
  assert.equal(await passwords.verifyPassword(password, first), true);
  for (const hash of [null, 'invalid', first]) assert.equal(await passwords.verifyPassword('wrong password', hash), false);
});

test('registration requires a delivered email code and stores only its digest', async () => {
  const app = setup();
  await app.requestAccountCode(requestInput, 'ip');
  assert.equal(app.users.length, 0);
  const code = codeFrom(app.sent[0]);
  const challenge = app.challenges.get('register:owner@example.com');
  assert.notEqual(challenge.tokenHash, code);
  assert.ok(challenge.expiresAt > new Date());
  await app.completeAccount({ ...requestInput, code, password, name: 'Owner' }, 'ip');
  assert.equal(app.users.length, 1);
  assert.ok(app.users[0].emailVerified);
  assert.equal(app.users[0].authVersion, 1);
  assert.equal(await app.passwords.verifyPassword(password, app.users[0].passwordHash), true);
  assert.equal(app.challenges.size, 0);
  await assert.rejects(app.completeAccount({ ...requestInput, code, password }, 'ip'), /invalid or expired/);
});

test('verified password setup keeps the existing demo user ID and saved website ownership', async () => {
  const app = setup([{ id: 'existing-owner', email: 'Owner@Example.com', passwordHash: null, authVersion: 0, portfolios: ['saved-website'] }]);
  await app.requestAccountCode({ email: 'owner@example.com', purpose: 'reset' }, 'ip');
  await app.completeAccount({ email: 'owner@example.com', purpose: 'reset', code: codeFrom(app.sent[0]), password }, 'ip');
  assert.equal(app.users.length, 1);
  assert.equal(app.users[0].id, 'existing-owner');
  assert.equal(app.users[0].portfolios[0], 'saved-website');
  assert.equal(app.users[0].authVersion, 1);
});

test('expired and wrong-purpose codes cannot create or modify an account', async () => {
  const app = setup();
  await app.requestAccountCode(requestInput, 'ip');
  const code = codeFrom(app.sent[0]);
  await assert.rejects(app.completeAccount({ ...requestInput, purpose: 'reset', code, password }, 'ip'), /invalid or expired/);
  app.challenges.get('register:owner@example.com').expiresAt = new Date(0);
  await assert.rejects(app.completeAccount({ ...requestInput, code, password }, 'ip'), /invalid or expired/);
  assert.equal(app.users.length, 0);
});

test('resending a code invalidates the previous code', async () => {
  const app = setup();
  await app.requestAccountCode(requestInput, 'ip');
  const original = codeFrom(app.sent[0]);
  await app.requestAccountCode(requestInput, 'ip');
  const latest = codeFrom(app.sent[1]);
  if (original !== latest) await assert.rejects(app.completeAccount({ ...requestInput, code: original, password }, 'ip'), /invalid or expired/);
  await app.completeAccount({ ...requestInput, code: latest, password }, 'ip');
  assert.equal(app.users.length, 1);
});

test('password reset increments the session version and invalidates all other codes', async () => {
  const app = setup([{ id: 'owner', email: 'owner@example.com', passwordHash: 'previous-hash', authVersion: 4 }]);
  await app.requestAccountCode({ ...requestInput, purpose: 'reset' }, 'ip');
  await app.completeAccount({ ...requestInput, purpose: 'reset', code: codeFrom(app.sent[0]), password }, 'ip');
  assert.equal(app.users[0].authVersion, 5);
  assert.notEqual(app.users[0].passwordHash, 'previous-hash');
  assert.equal(app.challenges.size, 0);
});

test('email failure removes the undelivered code and reports a safe error', async () => {
  const app = setup([], true);
  await assert.rejects(app.requestAccountCode(requestInput, 'ip'), /Unable to send/);
  assert.equal(app.challenges.size, 0);
});

test('unknown reset accounts and already-registered emails do not send codes or reveal account details', async () => {
  const app = setup([{ id: 'owner', email: 'owner@example.com', passwordHash: 'hash', authVersion: 1 }]);
  assert.equal(await app.requestAccountCode({ ...requestInput, email: 'unknown@example.com', purpose: 'reset' }, 'ip'), undefined);
  assert.equal(await app.requestAccountCode(requestInput, 'ip'), undefined);
  assert.equal(app.sent.length, 0);
});

test('database counters limit requests and incorrect code attempts', async () => {
  const app = setup();
  for (let i = 0; i < 3; i++) await app.requestAccountCode(requestInput, 'ip');
  await assert.rejects(app.requestAccountCode(requestInput, 'ip'), error => error.status === 429);
  for (let i = 0; i < 5; i++) await assert.rejects(app.completeAccount({ ...requestInput, code: 'not-the-code', password }, 'ip'));
  await assert.rejects(app.completeAccount({ ...requestInput, code: codeFrom(app.sent.at(-1)), password }, 'ip'), error => error.status === 429);
  assert.equal(app.users.length, 0);
});

test('account API rejects cross-origin, malformed, and weak-password requests before sending email', async () => {
  const app = setup();
  for (const [body, origin, expected] of [
    [JSON.stringify({ action: 'request-code', ...requestInput }), 'https://attacker.example', 403],
    ['null', 'https://app.example', 400], ['invalid-json', 'https://app.example', 400],
    [JSON.stringify({ action: 'complete', ...requestInput, code: '12345678', password: 'short' }), 'https://app.example', 400],
  ]) {
    const response = await app.handlers.POST(new NextRequest('https://app.example/api/account', {
      method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body,
    }));
    assert.equal(response.status, expected);
  }
  assert.equal(app.sent.length, 0);
  assert.equal(app.users.length, 0);
});

test('account schemas normalize email and preserve password whitespace', () => {
  const app = setup();
  const parsed = app.completeAccountSchema.parse({ ...requestInput, email: ' Owner@Example.com ', code: '12345678', password: ' password with spaces ' });
  assert.equal(parsed.email, 'owner@example.com');
  assert.equal(parsed.password, ' password with spaces ');
});
