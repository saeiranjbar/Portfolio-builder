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

function loadFile(file, prisma) {
  const testModule = { exports: {} };
  const logs = [];
  const compiled = ts.transpileModule(fs.readFileSync(path.join(projectRoot, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(compiled, {
    module: testModule, exports: testModule.exports,
    console: { error: (...args) => logs.push(args) },
    require(name) {
      if (name === './prisma') return { prisma };
      return loadDependency(name);
    },
  }, { filename: file });
  return { exports: testModule.exports, logs };
}

test('only credential rejection is described as an email/password problem', () => {
  const { exports: { loginErrorMessage } } = loadFile('lib/login-errors.ts');
  assert.match(loginErrorMessage('CredentialsSignin'), /Check your email and password/);
  for (const error of ['Configuration', 'DatabaseNotReady', 'DatabaseSignInFailed', undefined]) {
    assert.doesNotMatch(loginErrorMessage(error), /credentials|password/i);
  }
});

test('unknown server errors are not echoed into the login page', () => {
  const { exports: { loginErrorMessage } } = loadFile('lib/login-errors.ts');
  const message = loginErrorMessage('Internal Prisma error containing a connection secret');
  assert.doesNotMatch(message, /Prisma|secret/);
  assert.match(message, /server or connection error/);
});

test('empty demo credentials are rejected without accessing the database', async () => {
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: { findUnique() { throw new Error('Database should not be accessed'); } },
  });
  const authorize = authOptions.providers[0].options.authorize;
  assert.equal(await authorize({ email: '', password: 'test' }), null);
  assert.equal(await authorize({ email: 'owner@example.com', password: '' }), null);
});

test('existing demo accounts still sign in when the lookup succeeds', async () => {
  const user = { id: 'owner-id', email: 'owner@example.com', name: 'Owner' };
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: { findUnique: async () => user },
  });
  const result = await authOptions.providers[0].options.authorize({ email: user.email, password: 'test' });
  assert.equal(result.id, user.id);
  assert.equal(result.email, user.email);
});

test('new demo accounts are returned after a successful creation', async () => {
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: {
      findUnique: async () => null,
      create: async ({ data }) => ({ id: 'new-user', ...data }),
    },
  });
  const result = await authOptions.providers[0].options.authorize({
    email: 'owner@example.com', password: 'test',
  });
  assert.equal(result.id, 'new-user');
  assert.equal(result.name, 'owner');
});

for (const code of ['P2021', 'P2022', 'P1001', 'P1000']) {
  test(`database error ${code} is classified without exposing connection details`, async () => {
    const failure = Object.assign(new Error('Connection string with secret details'), { code });
    const { exports: { authOptions }, logs } = loadFile('lib/auth.ts', {
      user: { findUnique: async () => { throw failure; } },
    });
    await assert.rejects(
      authOptions.providers[0].options.authorize({ email: 'owner@example.com', password: 'test' }),
      (error) => error.message === (['P2021', 'P2022'].includes(code) ? 'DatabaseNotReady' : 'DatabaseSignInFailed'),
    );
    assert.match(JSON.stringify(logs), new RegExp(code));
    assert.doesNotMatch(JSON.stringify(logs), /secret details|Connection string/);
  });
}
