const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { attachDownloadSaver } = require('../electron/download-saver.cjs');

function fakeSession() {
  const handlers = new Map();
  return {
    on(event, fn) {
      handlers.set(fn, event);
    },
    off(event, fn) {
      if (handlers.get(fn) === event) handlers.delete(fn);
    },
    emit(event, ...args) {
      for (const [fn, name] of handlers) if (name === event) fn(...args);
    },
    count(event) {
      return [...handlers.values()].filter(name => name === event).length;
    },
  };
}

test('routes a browser download to Downloads with its requested file name', () => {
  const ses = fakeSession();
  const saved = [];
  const item = {
    getFilename: () => 'icon-4096.png',
    setSavePath: value => saved.push(value),
    on: () => {},
  };
  attachDownloadSaver(ses, { getPath: () => path.join('C:', 'Users', 'alice', 'Downloads') });
  ses.emit('will-download', {}, item);
  assert.deepEqual(saved, [path.join('C:', 'Users', 'alice', 'Downloads', 'icon-4096.png')]);
});

test('detaches its listener so development reloads cannot stack handlers', () => {
  const ses = fakeSession();
  const detach = attachDownloadSaver(ses, { getPath: () => path.join('C:', 'Users', 'alice', 'Downloads') });
  assert.equal(ses.count('will-download'), 1);
  detach();
  assert.equal(ses.count('will-download'), 0);
});
