import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { z } from 'zod';

const loadDependency = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));

function loadFile(file, prisma) {
  const testModule = { exports: {} };
  const logs = [];
  const compiled = ts.transpileModule(fs.readFileSync(path.join(projectRoot, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(compiled, {
    module: testModule, exports: testModule.exports, Buffer,
    console: { error: (...args) => logs.push(args) },
    require(name) {
      if (name === './prisma') return { prisma };
      if (name === './passwords') return loadFile('lib/passwords.ts').exports;
      if (name === './account-security') return {
        AccountError: class extends Error {},
        emailSchema: z.string().trim().toLowerCase().email(),
        enforceRateLimit: async () => {},
        findAccount: async email => prisma.user.findUnique({ where: { email } }),
      };
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

test('empty credentials are rejected without accessing the database', async () => {
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: { findUnique() { throw new Error('Database should not be accessed'); } },
  });
  const authorize = authOptions.providers[0].options.authorize;
  assert.equal(await authorize({ email: '', password: 'test' }), null);
  assert.equal(await authorize({ email: 'owner@example.com', password: '' }), null);
});

test('password authentication accepts only the correct password of a verified account', async () => {
  const { exports: { hashPassword } } = loadFile('lib/passwords.ts');
  const user = { id: 'owner-id', email: 'owner@example.com', name: 'Owner',
    passwordHash: await hashPassword('a secure password'), emailVerified: new Date(), authVersion: 1 };
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: { findUnique: async () => user },
  });
  const authorize = authOptions.providers[0].options.authorize;
  const result = await authorize({ email: user.email, password: 'a secure password' }, {});
  assert.equal(result.id, user.id);
  assert.equal(result.email, user.email);
  assert.equal(result.authVersion, 1);
  assert.equal(await authorize({ email: user.email, password: 'wrong password' }, {}), null);
  user.emailVerified = null;
  assert.equal(await authorize({ email: user.email, password: 'a secure password' }, {}), null);
});

test('unknown emails are rejected and are never auto-registered', async () => {
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: {
      findUnique: async () => null,
      create: async () => { throw new Error('Sign-in must not create accounts'); },
    },
  });
  const result = await authOptions.providers[0].options.authorize({
    email: 'owner@example.com', password: 'test',
  }, {});
  assert.equal(result, null);
});

test('old demo accounts reject arbitrary passwords until email-verified password setup', async () => {
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: { findUnique: async () => ({ id: 'demo', email: 'demo@example.com', passwordHash: null }) },
  });
  assert.equal(await authOptions.providers[0].options.authorize({ email: 'demo@example.com', password: 'anything' }, {}), null);
});

test('old demo sessions and sessions invalidated by password resets lose access', async () => {
  const { exports: { authOptions } } = loadFile('lib/auth.ts', {
    user: { findUnique: async () => ({ authVersion: 2, passwordHash: 'hash', emailVerified: new Date() }) },
  });
  const { jwt, session } = authOptions.callbacks;
  for (const token of [{ id: 'demo', email: 'demo@example.com' }, { id: 'owner', authVersion: 1 }]) {
    const invalid = await jwt({ token });
    assert.equal(Object.keys(invalid).length, 0);
    const denied = await session({ session: { user: { email: 'owner@example.com' } }, token: invalid });
    assert.equal(denied.user, undefined);
  }
  const token = await jwt({ token: { id: 'owner', authVersion: 2 } });
  assert.equal(token.id, 'owner');
});

for (const code of ['P2021', 'P2022', 'P1001', 'P1000']) {
  test(`database error ${code} is classified without exposing connection details`, async () => {
    const failure = Object.assign(new Error('Connection string with secret details'), { code });
    const { exports: { authOptions }, logs } = loadFile('lib/auth.ts', {
      user: { findUnique: async () => { throw failure; } },
    });
    await assert.rejects(
      authOptions.providers[0].options.authorize({ email: 'owner@example.com', password: 'test' }, {}),
      (error) => error.message === (['P2021', 'P2022'].includes(code) ? 'DatabaseNotReady' : 'DatabaseSignInFailed'),
    );
    assert.match(JSON.stringify(logs), new RegExp(code));
    assert.doesNotMatch(JSON.stringify(logs), /secret details|Connection string/);
  });
}
