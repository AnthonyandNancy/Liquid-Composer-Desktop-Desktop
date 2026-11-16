import { useState, useRef, useEffect, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { useStore } from '@nanostores/react';
import { $selectedLayerId, $hoveredLayerId, selectLayer, inspectLayer } from '../../store/uiStore';
import {
  $layers,
  removeLayer,
  duplicateLayer,
  toggleLayerVisibility,
  toggleGroupCollapsed,
  updateLayer,
  arrangeLayer,
  copyLayer,
  cutLayer,
  pasteLayers,
  copiedLayerMarker,
  copyLayerStyle,
  pasteLayerStyle,
} from '../../store/iconStore';
import type { CSSProperties } from 'react';
import type { FillConfig, Layer } from '../../types/index';
import { CaretRight, Eye, EyeSlash, Stack, Image, Copy, X } from '@phosphor-icons/react';
import { LayerMenu, type MenuEntry } from './LayerMenu';
import { LAYER_INDENT } from './useLayerDrag';
import { t } from '../../i18n';

interface LayerItemProps {
  layer: Layer;
  depth?: number;
  isDragging?: boolean;
  isInsideTarget?: boolean;
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>, id: string) => void;
}

function thumbFill(url: string, fill: Exclude<FillConfig, { type: 'none' }>): CSSProperties {
  const mask = `url("${url}") center / contain no-repeat`;
  const background = fill.type === 'solid'
    ? fill.color
    : `linear-gradient(to bottom, ${fill.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`;
  return { background, mask, WebkitMask: mask };
}

function menuEntries(layer: Layer, rename: () => void): MenuEntry[] {
  const siblings = $layers.get().filter((l) => l.parentId === layer.parentId).sort((a, b) => b.order - a.order);
  const index = siblings.findIndex((l) => l.id === layer.id);
  const toClipboard = (marker: string | null) => { if (marker) navigator.clipboard?.writeText(marker).catch(() => {}); };
  return [
    { label: t('layers.menu.rename'), onSelect: rename },
    { label: layer.visible ? t('layers.menu.hide') : t('layers.menu.show'), onSelect: () => toggleLayerVisibility(layer.id) },
    { label: t('layers.menu.cut'), separated: true, onSelect: () => { toClipboard(cutLayer(layer.id)); selectLayer(null); } },
    { label: t('layers.menu.copy'), onSelect: () => toClipboard(copyLayer(layer.id)) },
    { label: t('layers.menu.paste'), disabled: !copiedLayerMarker(), onSelect: () => { pasteLayers().catch(console.error); } },
    { label: t('layers.menu.duplicate'), onSelect: () => { duplicateLayer(layer.id).catch(console.error); } },
    { label: t('layers.menu.copyStyle'), separated: true, onSelect: () => copyLayerStyle(layer.id) },
    { label: t('layers.menu.pasteStyle'), onSelect: () => { pasteLayerStyle(layer.id); } },
    { label: t('layers.menu.bringToFront'), separated: true, disabled: index <= 0, onSelect: () => arrangeLayer(layer.id, 'front') },
    { label: t('layers.menu.bringForward'), disabled: index <= 0, onSelect: () => arrangeLayer(layer.id, 'forward') },
    { label: t('layers.menu.sendBackward'), disabled: index >= siblings.length - 1, onSelect: () => arrangeLayer(layer.id, 'backward') },
    { label: t('layers.menu.sendToBack'), disabled: index >= siblings.length - 1, onSelect: () => arrangeLayer(layer.id, 'back') },
    ...(layer.parentId ? [{ label: t('layers.menu.selectParent'), separated: true, onSelect: () => selectLayer(layer.parentId) }] : []),
    { label: t('layers.menu.delete'), separated: true, danger: true, onSelect: () => { removeLayer(layer.id); selectLayer(null); } },
  ];
}

export function LayerItem({
  layer,
  depth = 0,
  isDragging = false,
  isInsideTarget = false,
  onPointerDown,
}: LayerItemProps) {
  const selectedId = useStore($selectedLayerId);
  const isSelected = selectedId === layer.id;
  const isGroup = layer.type === 'group';

  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(layer.name);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => {
    setMenu(null);
    rowRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (editing) {
      setNameValue(layer.name);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commitRename = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== layer.name) updateLayer(layer.id, { name: trimmed });
    setEditing(false);
  };

  const openMenuAtRow = () => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (rect) setMenu({ x: rect.left + 24, y: rect.bottom });
  };

  return (
    <div
      ref={rowRef}
      data-row-id={layer.id}
      onPointerDown={(e) => { if (!editing) onPointerDown?.(e, layer.id); }}
      onMouseEnter={() => $hoveredLayerId.set(layer.id)}
      onMouseLeave={() => $hoveredLayerId.set(null)}
      onClick={() => !editing && inspectLayer(layer.id)}
      onContextMenu={(e) => {
        if (editing) return;
        e.preventDefault();
        selectLayer(layer.id);
        setMenu({ x: e.clientX, y: e.clientY });
      }}
      tabIndex={0}
      role="treeitem"
      aria-level={depth + 1}
      aria-selected={isSelected}
      aria-expanded={isGroup ? !layer.collapsed : undefined}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectLayer(layer.id);
        } else if (e.key === 'F2') {
          e.preventDefault();
          setEditing(true);
        } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
          e.preventDefault();
          selectLayer(layer.id);
          openMenuAtRow();
        }
      }}
      data-selected={isSelected}
      data-visible={layer.visible}
      data-dragging={isDragging}
      data-drop-inside={isInsideTarget}
      style={{ paddingLeft: 6 + depth * LAYER_INDENT }}
      className="layer-row"
    >
      {isGroup ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleGroupCollapsed(layer.id); }}
          aria-label={t(layer.collapsed ? 'layers.expand' : 'layers.collapse', { name: layer.name })}
          aria-expanded={!layer.collapsed}
          className="layer-disclosure"
        >
          <CaretRight size={10} weight="bold" />
        </button>
      ) : (
        <span className="layer-disclosure" aria-hidden="true" />
      )}

      <span className="layer-thumb" data-group={isGroup} aria-hidden="true">
        {isGroup ? (
          <Stack size={17} />
        ) : layer.blobUrl && layer.fill.type !== 'none' ? (
          <span className="layer-thumb-fill" style={{ ...thumbFill(layer.blobUrl, layer.fill), opacity: layer.opacity / 100 }} />
        ) : layer.blobUrl ? (
          <img src={layer.blobUrl} alt="" draggable={false} style={{ opacity: layer.opacity / 100 }} />
        ) : (
          <Image size={14} />
        )}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter')  commitRename();
            if (e.key === 'Escape') setEditing(false);
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={t('layers.layerName')}
          className="layer-name-input"
        />
      ) : (
        <span
          className="layer-name"
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
          title={t('layers.doubleClickRename')}
        >
          {layer.name}
        </span>
      )}

      <div className="layer-actions">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id).catch(console.error); }}
          aria-label={t('layers.duplicateNamed', { name: layer.name })}
          title={t('layers.duplicateLayer')}
          className="layer-action"
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
          aria-label={t(layer.visible ? 'layers.hideNamed' : 'layers.showNamed', { name: layer.name })}
          title={t(layer.visible ? 'layers.hideLayer' : 'layers.showLayer')}
          className="layer-action layer-visibility"
        >
          {layer.visible ? <Eye size={15} /> : <EyeSlash size={15} />}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); selectLayer(null); }}
          aria-label={t('layers.removeNamed', { name: layer.name })}
          title={t('layers.removeLayer')}
          className="layer-action layer-remove"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      {menu && (
        <LayerMenu
          x={menu.x}
          y={menu.y}
          label={t('layers.actions', { name: layer.name })}
          items={menuEntries(layer, () => setEditing(true))}
          onClose={closeMenu}
        />
      )}
    </div>
  );
}
