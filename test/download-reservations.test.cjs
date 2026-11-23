const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { createDownloadPlanner } = require('../electron/downloads.cjs');

const dir = path.join('C:', 'Users', 'alice', 'Downloads');

test('reserves distinct paths for concurrent exports of the same name', () => {
  const plan = createDownloadPlanner({ downloadsDir: dir, exists: () => false });
  const first = plan('icon.zip');
  const second = plan('icon.zip');
  assert.equal(first.savePath, path.join(dir, 'icon.zip'));
  assert.equal(second.savePath, path.join(dir, 'icon (2).zip'));
  first.release();
  second.release();
});

test('releases a cancelled export so the path can be reused', () => {
  const plan = createDownloadPlanner({ downloadsDir: dir, exists: () => false });
  const first = plan('icon.png');
  first.release();
  const second = plan('icon.png');
  assert.equal(second.savePath, path.join(dir, 'icon.png'));
  second.release();
});

test('keeps counting when an earlier export completed on disk', () => {
  const taken = new Set();
  const plan = createDownloadPlanner({ downloadsDir: dir, exists: file => taken.has(file) });
  const first = plan('icon.png');
  taken.add(first.savePath);
  first.release();
  assert.equal(plan('icon.png').savePath, path.join(dir, 'icon (2).png'));
});
