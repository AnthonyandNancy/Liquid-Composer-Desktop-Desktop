import { useStore } from "@nanostores/react";
import {
    $selectedLayerId,
    $appearanceMode,
    CANVAS_SELECTION_ID,
} from "../../store/uiStore";
import { $layers, updateLayer } from "../../store/iconStore";
import { ColorSection } from "./ColorSection";
import { LiquidGlassSection } from "./LiquidGlassSection";
import { CompositionSection } from "./CompositionSection";
import { BackgroundControls } from "./BackgroundControls";
import { Slider } from "../ui/Slider";
import { Select } from "../ui/Select";
import type { BlendMode } from "../../types/index";
import { t } from "../../i18n";
import { BLEND_MODE_OPTIONS } from "./options";

const BLEND_MODES = BLEND_MODE_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));

function GroupColorSection() {
    const selectedId = useStore($selectedLayerId);
    const layers = useStore($layers);
    const layer = layers.find(l => l.id === selectedId);
    if (!layer) return null;

    const childCount = layers.filter(l => l.parentId === layer.id).length;

    return (
        <div className="border-b border-white/[0.07] pb-5">
            <div className="flex items-center justify-between px-3 py-3">
                <span className="text-xs font-semibold text-[#ebebf5]">
                    {t('inspector.group')}
                </span>
                <span className="text-2xs text-[#636366] bg-white/[0.07] px-1.5 py-0.5 rounded">
                    {t('inspector.layerCount', { count: childCount })}
                </span>
            </div>

            <div className="px-3 space-y-3">
                <Slider
                    layout="stacked"
                    label={t("common.opacity")}
                    value={layer.opacity}
                    onChange={v => updateLayer(layer.id, { opacity: v })}
                    min={0}
                    max={100}
                />

                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#636366] w-16 shrink-0">
                        {t("inspector.blend")}
                    </span>
                    <Select
                        ariaLabel={t("inspector.groupBlendMode")}
                        value={layer.blendMode}
                        onChange={v =>
                            updateLayer(layer.id, { blendMode: v as BlendMode })
                        }
                        options={BLEND_MODES}
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
}

export function InspectorPanel() {
    const selectedId = useStore($selectedLayerId);
    const appearanceMode = useStore($appearanceMode);
    const layers = useStore($layers);
    const layer = layers.find(l => l.id === selectedId);
    const isCanvas = selectedId === CANVAS_SELECTION_ID;

    return (
        <aside
            aria-label={t("inspector.title")}
            className="inspector-panel w-[280px] shrink-0 min-h-0 flex flex-col">
            <div className="editor-panel-header">
                <span className="font-semibold truncate" title={layer?.name}>
                    {isCanvas ? t("inspector.canvas") : layer ? layer.name : t("inspector.title")}
                </span>
            </div>

            {isCanvas ? (
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="px-3 py-3 text-xs font-semibold text-[#ebebf5]">
                        {t("inspector.color")}
                    </div>
                    {appearanceMode !== "default" && (
                        <p className="px-3 pb-3 glass-setting-caption">
                            {t("inspector.appearanceNote")}
                        </p>
                    )}
                    <BackgroundControls />
                </div>
            ) : !layer ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-xs text-[#a1a1aa] text-center max-w-44 leading-relaxed">
                        {t("inspector.selectLayer")}
                    </p>
                </div>
            ) : (
                <div key={layer.id} className="flex-1 min-h-0 overflow-y-auto">
                    {layer.type === "group" ? (
                        <>
                            <CompositionSection />
                            <GroupColorSection />
                        </>
                    ) : (
                        <>
                            <CompositionSection />
                            <ColorSection />
                            <LiquidGlassSection />
                        </>
                    )}
                </div>
            )}
        </aside>
    );
}
