const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { attachDownloadSaver } = require('../electron/download-saver.cjs');

test('falls back to a safe name when the browser sends no filename', () => {
  const saved = [];
  const handlers = [];
  const ses = { on: (_, fn) => handlers.push(fn), off: () => {} };
  const item = {
    getFilename: () => '',
    setSavePath: value => saved.push(value),
    on: () => {},
  };
  attachDownloadSaver(ses, { getPath: () => path.join('C:', 'Users', 'alice', 'Downloads') });
  handlers[0]({}, item);
  assert.deepEqual(saved, [path.join('C:', 'Users', 'alice', 'Downloads', 'download')]);
});
