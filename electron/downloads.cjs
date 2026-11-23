const fs = require('node:fs');
const path = require('node:path');

const MAX_NAME = 180;
const FALLBACK = 'download';
const SEPARATORS = /[\\/]/;
const UNSAFE = /[:*?"<>|\x00-\x1f]/g;

function safeDownloadName(suggestedName) {
  let raw;
  try {
    raw = String(suggestedName ?? '');
  } catch {
    raw = '';
  }
  // DownloadItem normally supplies a leaf name; still take only the final
  // path segment so a compromised renderer cannot direct the save elsewhere.
  const leaf = raw.split(SEPARATORS).pop() ?? '';
  const name = leaf.replace(UNSAFE, '-').trim();
  if (!name || name === '.' || name === '..') return FALLBACK;
  if (name.length > MAX_NAME) {
    const ext = path.extname(name).slice(0, 32);
    return name.slice(0, MAX_NAME - ext.length) + ext;
  }
  return name;
}

function uniqueDownloadPath(dir, fileName, exists = fs.existsSync) {
  const parsed = path.parse(fileName);
  let candidate = path.join(dir, fileName);
  for (let n = 2; exists(candidate); n += 1) {
    candidate = path.join(dir, `${parsed.name} (${n})${parsed.ext}`);
  }
  return candidate;
}

function downloadPlan({ downloadsDir, suggestedName, exists = fs.existsSync }) {
  const name = safeDownloadName(suggestedName);
  return { savePath: uniqueDownloadPath(downloadsDir, name, exists) };
}

function createDownloadPlanner({ downloadsDir, exists = fs.existsSync }) {
  const reserved = new Set();
  return suggestedName => {
    const name = safeDownloadName(suggestedName);
    const isTaken = file => reserved.has(file) || exists(file);
    const savePath = uniqueDownloadPath(downloadsDir, name, isTaken);
    reserved.add(savePath);
    let released = false;
    return {
      savePath,
      release() {
        if (released) return;
        released = true;
        reserved.delete(savePath);
      },
    };
  };
}

module.exports = {
  createDownloadPlanner,
  downloadPlan,
  safeDownloadName,
  uniqueDownloadPath,
};
