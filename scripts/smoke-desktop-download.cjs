const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const EXE = process.env.LIQUID_COMPOSER_EXE || path.join(ROOT, 'release', 'win-unpacked', '液态玻璃图标生成器.exe');
const PORT = Number(process.env.LIQUID_COMPOSER_CDP_PORT || 9350);
const DOWNLOADS = path.join(os.homedir(), 'Downloads');
const sleep = ms => new Promise(r => setTimeout(r, ms));

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result);
    };
  }
  async open() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  close() { this.ws.close(); }
}

async function pageTarget() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = targets.find(target => target.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(250);
  }
  throw new Error(`packaged app did not expose a renderer on port ${PORT}`);
}

async function clickExport(cdp) {
  const result = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const button = document.querySelector('button.editor-export-action');
      if (!button) return null;
      const r = button.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`,
    returnByValue: true,
  });
  const point = result.result?.value;
  if (!point) throw new Error('export button was not rendered');
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
}

async function waitForNamedDownload(before, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const added = fs.readdirSync(DOWNLOADS).filter(name => !before.has(name));
    const complete = added.find(name => /\.png$/i.test(name));
    if (complete) return { name: complete, elapsedMs: Date.now() - started, added };
    await sleep(250);
  }
  const added = fs.readdirSync(DOWNLOADS).filter(name => !before.has(name));
  throw new Error(`export did not produce a .png in ${DOWNLOADS}; got ${JSON.stringify(added)}`);
}

(async () => {
  if (!fs.existsSync(EXE)) throw new Error(`packaged executable not found: ${EXE}`);
  const profile = path.join(os.tmpdir(), `liquid-composer-smoke-${process.pid}`);
  const before = new Set(fs.readdirSync(DOWNLOADS));
  const child = spawn(EXE, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
  ], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: undefined },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = [];
  child.stdout.on('data', chunk => output.push(String(chunk)));
  child.stderr.on('data', chunk => output.push(String(chunk)));

  let cdp;
  try {
    const target = await pageTarget();
    cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send('Runtime.enable');
    await cdp.send('Runtime.evaluate', {
      expression: `new Promise(async resolve => {
        for (let i = 0; i < 100 && !window.liquidComposer; i++) await new Promise(r => setTimeout(r, 100));
        await window.liquidComposer.ready;
        resolve(true);
      })`,
      awaitPromise: true,
      returnByValue: true,
    });
    await clickExport(cdp);
    const download = await waitForNamedDownload(before);
    const file = path.join(DOWNLOADS, download.name);
    const bytes = fs.readFileSync(file);
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`not a PNG: ${file}`);
    if (!/^icon-\d+ \((\d+)\)\.png$|^icon-\d+\.png$/.test(download.name)) throw new Error(`unexpected export name: ${download.name}`);
    console.log(JSON.stringify({ ok: true, file, bytes: bytes.length, elapsedMs: download.elapsedMs }));
    fs.rmSync(file, { force: true });
  } finally {
    cdp?.close();
    child.kill();
    await new Promise(resolve => setTimeout(resolve, 500));
    fs.rmSync(profile, { recursive: true, force: true });
    const added = fs.readdirSync(DOWNLOADS).filter(name => !before.has(name));
    for (const name of added) {
      if (/\.tmp$/i.test(name)) {
        fs.rmSync(path.join(DOWNLOADS, name), { force: true });
      }
    }
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
