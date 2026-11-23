const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { attachDownloadSaver } = require('../electron/download-saver.cjs');

function fakeSession() {
  const handlers = [];
  return {
    on: (_, fn) => handlers.push(fn),
    off: () => {},
    fire: item => handlers[0]({}, item),
  };
}

function fakeItem(name) {
  const listeners = {};
  return {
    getFilename: () => name,
    setSavePath(value) { this.path = value; },
    on(event, fn) { (listeners[event] ??= []).push(fn); },
    emit(event, state) { for (const fn of listeners[event] ?? []) fn({}, state); },
  };
}

test('reuses the path when the user cancels the download', () => {
  const ses = fakeSession();
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  attachDownloadSaver(ses, { getPath: () => dir });
  const first = fakeItem('icon.png');
  ses.fire(first);
  assert.equal(first.path, path.join(dir, 'icon.png'));
  first.emit('done', 'cancelled');
  const second = fakeItem('icon.png');
  ses.fire(second);
  assert.equal(second.path, path.join(dir, 'icon.png'));
});

test('keeps the path reserved while the download is still running', () => {
  const ses = fakeSession();
  const dir = path.join('C:', 'Users', 'alice', 'Downloads');
  attachDownloadSaver(ses, { getPath: () => dir });
  const first = fakeItem('icon.zip');
  const second = fakeItem('icon.zip');
  ses.fire(first);
  ses.fire(second);
  assert.equal(first.path, path.join(dir, 'icon.zip'));
  assert.equal(second.path, path.join(dir, 'icon (2).zip'));
});
