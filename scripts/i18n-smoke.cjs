const { chromium } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');

const CHROME =
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : undefined);
const BASE_URL = process.env.I18N_SMOKE_URL || 'http://127.0.0.1:4173/';
const SHOT_DIR = path.join(__dirname, '..', 'docs', 'superpowers', 'plans', 'screenshots');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function visibleText(page) {
  return page.locator('body').innerText();
}

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('pageerror', error => {
    throw new Error(`未捕获的页面异常：${error.message}`);
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  assert((await page.getAttribute('html', 'lang')) === 'zh-CN', 'html lang 不是 zh-CN');

  const homeText = await visibleText(page);
  for (const text of ['图层', '检查器', '导出', '背景', '画布', '未命名']) {
    assert(homeText.includes(text), `缺少中文文案：${text}`);
  }
  assert(!/\b(Layers|Inspector|Export|Background|Untitled)\b/.test(homeText), '主页仍含英文界面文案');

  await page.locator('button[aria-label="添加图层"]').click();
  await page.waitForTimeout(300);
  assert((await visibleText(page)).includes('图层 1'), '新增图层未使用中文默认名');

  const layerRow = page.locator('.layer-row').first();
  await layerRow.click();
  await page.waitForTimeout(300);
  const inspectorText = await visibleText(page);
  for (const text of ['构图', '颜色', '不透明度', '混合', '填充', '折射', '模糊', '半透明']) {
    assert(inspectorText.includes(text), `检查器缺少中文文案：${text}`);
  }

  await page.locator('button[aria-label="添加组"]').click();
  await page.waitForTimeout(300);
  assert((await visibleText(page)).includes('组 1'), '新增组未使用中文默认名');

  await page.locator('.layer-row').first().click({ button: 'right' });
  await page.waitForTimeout(200);
  const menuText = await page.locator('.layer-menu').innerText();
  for (const text of ['重命名', '隐藏', '剪切', '复制', '粘贴', '移到最前', '删除']) {
    assert(menuText.includes(text), `右键菜单缺少中文文案：${text}`);
  }
  assert(!/\b(Rename|Hide|Cut|Copy|Paste|Delete)\b/.test(menuText), '右键菜单仍含英文');
  await page.keyboard.press('Escape');

  await page.locator('button[aria-controls="export-menu"]').first().click();
  await page.waitForTimeout(200);
  const exportText = await page.locator('#export-menu').innerText();
  for (const text of ['复制 PNG', '所有外观', 'Apple 平台图集', '导出 .icon', '打开 .icon…']) {
    assert(exportText.includes(text), `导出菜单缺少中文文案：${text}`);
  }
  await page.keyboard.press('Escape');

  await page.locator('button[aria-controls="light-menu"]').click();
  await page.waitForTimeout(200);
  const lightText = await page.locator('#light-menu').innerText();
  for (const text of ['顶部', '右上', '右侧', '右下', '底部', '左下', '左侧', '左上']) {
    assert(lightText.includes(text), `光照菜单缺少中文文案：${text}`);
  }
  await page.keyboard.press('Escape');

  await page.screenshot({
    path: path.join(SHOT_DIR, 'i18n-desktop.png'),
    fullPage: true,
  });

  const compact = await browser.newPage({ viewport: { width: 960, height: 600 } });
  await compact.goto(BASE_URL, { waitUntil: 'networkidle' });
  const compactOverflow = await compact.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  assert(!compactOverflow, '960×600 下出现横向溢出');
  await compact.screenshot({
    path: path.join(SHOT_DIR, 'i18n-compact.png'),
    fullPage: true,
  });

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto(BASE_URL, { waitUntil: 'networkidle' });
  const tabs = await mobile.locator('.editor-tabbar button').allTextContents();
  assert(
    JSON.stringify(tabs) === JSON.stringify(['画布', '图层', '检查器']),
    `移动端标签不正确：${tabs.join(', ')}`,
  );
  await mobile.screenshot({
    path: path.join(SHOT_DIR, 'i18n-mobile.png'),
    fullPage: true,
  });

  await browser.close();
  console.log('运行时冒烟通过');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
