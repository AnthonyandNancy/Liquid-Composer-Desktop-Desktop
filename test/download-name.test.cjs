const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { uniqueDownloadPath } = require('../electron/downloads.cjs');

test('uses the requested browser download name', () => {
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  assert.equal(
    uniqueDownloadPath(dir, 'icon-1024.png', () => false),
    path.join(dir, 'icon-1024.png'),
  );
});

test('adds a numeric suffix instead of overwriting an existing export', () => {
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  const taken = new Set([path.join(dir, 'icon-1024.png')]);
  assert.equal(
    uniqueDownloadPath(dir, 'icon-1024.png', p => taken.has(p)),
    path.join(dir, 'icon-1024 (2).png'),
  );
});
