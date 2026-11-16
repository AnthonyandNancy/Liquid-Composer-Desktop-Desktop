import { zhCN } from './messages';

export const LOCALE = 'zh-CN';

type ParamValue = string | number;
type Params = Record<string, ParamValue>;

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<typeof zhCN>;

function lookup(key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => {
      if (node && typeof node === 'object' && part in node) {
        return (node as Record<string, unknown>)[part];
      }
      return undefined;
    }, zhCN);

  return typeof value === 'string' ? value : undefined;
}

export function t(key: MessageKey, params?: Params): string {
  const template = lookup(key);
  if (!template) {
    if (import.meta.env.DEV) console.warn(`[i18n] 缺少文案键：${key}`);
    return key;
  }

  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params && name in params ? String(params[name]) : `{${name}}`,
  );
}

export function setDocumentLanguage(): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = LOCALE;
  }
}
