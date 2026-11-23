const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { downloadPlan } = require('../electron/downloads.cjs');

test('derives the save name from the anchor download name', () => {
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  assert.deepEqual(
    downloadPlan({ downloadsDir: dir, suggestedName: 'icon-4096.png', exists: () => false }),
    { savePath: path.join(dir, 'icon-4096.png') },
  );
});

test('falls back to a safe name when the download name is empty or hostile', () => {
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  const exists = () => false;
  assert.deepEqual(
    downloadPlan({ downloadsDir: dir, suggestedName: '', exists }),
    { savePath: path.join(dir, 'download') },
  );
  assert.deepEqual(
    downloadPlan({ downloadsDir: dir, suggestedName: '../../evil.png', exists }),
    { savePath: path.join(dir, 'evil.png') },
  );
  assert.deepEqual(
    downloadPlan({ downloadsDir: dir, suggestedName: 'CON.png', exists }),
    { savePath: path.join(dir, 'CON.png') },
  );
});

test('does not accept an absolute or nested path as a download name', () => {
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  assert.deepEqual(
    downloadPlan({ downloadsDir: dir, suggestedName: String.raw`C:\Windows\evil.png`, exists: () => false }),
    { savePath: path.join(dir, 'evil.png') },
  );
});

test('sanitizes the name and keeps the requested extension', () => {
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  assert.deepEqual(
    downloadPlan({ downloadsDir: dir, suggestedName: '我的图标:*.zip', exists: () => false }),
    { savePath: path.join(dir, '我的图标--.zip') },
  );
});
