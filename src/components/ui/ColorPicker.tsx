import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { t, type MessageKey } from '../../i18n';
import { Popover } from './Popover';

const SYSTEM_COLORS: { hex: string; label: MessageKey }[] = [
  { hex: '#FF383C', label: 'background.colors.red' }, { hex: '#FF8D28', label: 'background.colors.orange' },
  { hex: '#FFCC00', label: 'background.colors.yellow' }, { hex: '#34C759', label: 'background.colors.green' },
  { hex: '#00C8B3', label: 'background.colors.mint' }, { hex: '#00C3D0', label: 'background.colors.teal' },
  { hex: '#00C0E8', label: 'background.colors.cyan' }, { hex: '#0088FF', label: 'background.colors.blue' },
  { hex: '#6155F5', label: 'background.colors.indigo' }, { hex: '#CB30E0', label: 'background.colors.purple' },
  { hex: '#FF2D55', label: 'background.colors.pink' }, { hex: '#AC7F5E', label: 'background.colors.brown' },
  { hex: '#8E8E93', label: 'background.colors.gray' },
];

const HEX_RE = /^#[0-9a-f]{6}$/i;
const RECENT_KEY = 'liquid-composer-recent-colors';
const RECENT_LIMIT = 8;

type EyeDropperResult = { sRGBHex: string };
type EyeDropperInstance = { open: () => Promise<EyeDropperResult> };
type EyeDropperConstructor = new () => EyeDropperInstance;

function readRecent(): string[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(list) ? list.filter((c): c is string => typeof c === 'string' && HEX_RE.test(c)).slice(0, RECENT_LIMIT) : [];
  } catch { return []; }
}

function pushRecent(color: string) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([color, ...readRecent().filter((c) => c !== color)].slice(0, RECENT_LIMIT))); } catch {}
}

export function ColorPicker({ value, onChange, label, className = 'color-well', children }: {
  value: string; onChange: (hex: string) => void; label: string; className?: string; children?: React.ReactNode;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openedWith = useRef('');
  const draftRef = useRef('');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('#000000');
  const [hexText, setHexText] = useState('');
  const [tab, setTab] = useState<'standard' | 'recent'>('standard');
  const [recent, setRecent] = useState<string[]>([]);
  const [eyeDropperAvailable, setEyeDropperAvailable] = useState(false);

  useEffect(() => {
    setEyeDropperAvailable(typeof window !== 'undefined' && Boolean((window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper));
  }, []);

  const apply = (hex: string) => {
    const color = hex.toLowerCase();
    draftRef.current = color;
    setDraft(color);
    setHexText(color.slice(1).toUpperCase());
    onChange(color);
  };

  const pickScreenColor = async () => {
    const EyeDropper = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!EyeDropper) return;
    try {
      const result = await new EyeDropper().open();
      if (HEX_RE.test(result.sRGBHex)) apply(result.sRGBHex);
    } catch (error) {
      // User cancellation is expected; do not close the color picker.
      if (error instanceof Error && error.name !== 'AbortError') console.error('Screen color picker failed:', error);
    }
  };

  const show = () => {
    const start = HEX_RE.test(value) ? value.toLowerCase() : '#000000';
    openedWith.current = draftRef.current = start;
    setDraft(start);
    setHexText(start.slice(1).toUpperCase());
    setRecent(readRecent());
    setOpen(true);
  };

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (draftRef.current !== openedWith.current) pushRecent(draftRef.current);
    if (refocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) bodyRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus({ preventScroll: true });
  }, [open]);

  const swatches =
    tab === 'standard'
      ? SYSTEM_COLORS.map((color) => ({ hex: color.hex, label: t(color.label) }))
      : recent.map((hex) => ({ hex, label: hex.toUpperCase() }));

  return (
    <>
      <button ref={buttonRef} type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open} title={label}
        onClick={() => (open ? close(false) : show())} onBlur={(e) => { if (open) e.stopPropagation(); }}
        className={className} style={children || !HEX_RE.test(value) ? undefined : { background: value }}>
        {children}
      </button>
      {open && (
        <Popover anchor={buttonRef.current} onClose={close} role="dialog" aria-label={label} className="color-popover">
          <div ref={bodyRef}>
            <HexColorPicker color={draft} onChange={apply} />
            {eyeDropperAvailable && (
              <button type="button" onClick={pickScreenColor} className="w-full mt-2 rounded-md border border-white/10 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/[0.06]">
                {t('colorPicker.pickFromScreen')}
              </button>
            )}
            <label className="color-hex-field">
              <span aria-hidden="true">#</span>
              <input type="text" aria-label={t('common.hexColor', { label })} value={hexText} maxLength={7} spellCheck={false} autoComplete="off"
                onChange={(e) => { const text = e.target.value.replace('#', ''); setHexText(text); if (HEX_RE.test(`#${text}`)) apply(`#${text}`); }}
                onBlur={() => setHexText(draft.slice(1).toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') close(true); }} />
            </label>
            <div className="glass-segments color-tabs">
              <button type="button" aria-pressed={tab === 'standard'} onClick={() => setTab('standard')}>{t('colorPicker.standard')}</button>
              <button type="button" aria-pressed={tab === 'recent'} onClick={() => setTab('recent')}>{t('colorPicker.recent')}</button>
            </div>
            <div className="color-swatches" role="group" aria-label={t(tab === 'standard' ? 'colorPicker.systemColors' : 'colorPicker.recentColors')}>
              {swatches.map(({ hex, label: name }) => <button key={hex} type="button" title={name} aria-label={name}
                aria-pressed={hex.toLowerCase() === draft} onClick={() => apply(hex)} className="color-swatch" style={{ background: hex }} />)}
              {!swatches.length && <span className="color-swatches-empty">{t('colorPicker.noRecent')}</span>}
            </div>
          </div>
        </Popover>
      )}
    </>
  );
}
