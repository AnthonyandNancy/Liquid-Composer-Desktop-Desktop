import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $layers, updateLayer, updateLayerFill } from "../../store/iconStore";
import { $selectedLayerId } from "../../store/uiStore";
import { Slider } from "../ui/Slider";
import { Select } from "../ui/Select";
import { ColorPicker } from "../ui/ColorPicker";
import type { BlendMode, FillConfig } from "../../types/index";
import { t } from "../../i18n";
import { BLEND_MODE_OPTIONS, FILL_TYPE_OPTIONS, GRADIENT_TYPE_OPTIONS } from "./options";

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const BLEND_MODES = BLEND_MODE_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));
const FILL_TYPES = FILL_TYPE_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));
const GRADIENT_TYPES = GRADIENT_TYPE_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function ColorSection() {
    const selectedId = useStore($selectedLayerId);
    const layers = useStore($layers);
    const layer = layers.find(l => l.id === selectedId);

    const [localSolidColor, setLocalSolidColor] = useState<string>("#ffffff");
    const debouncedSolidColor = useDebounce(localSolidColor, 10);

    const [localStops, setLocalStops] = useState<
        { offset: number; color: string }[]
    >([]);
    const debouncedStops = useDebounce(localStops, 10);

    const skipSolidSync = useRef(true);
    const skipStopsSync = useRef(true);

    useLayoutEffect(() => {
        if (layer?.fill.type === "solid") {
            const color = layer.fill.color ?? "#ffffff";
            if (color !== localSolidColor && color !== debouncedSolidColor) {
                skipSolidSync.current = true;
                setLocalSolidColor(color);
            }
        } else if (layer?.fill.type === "gradient" && "stops" in layer.fill) {
            const stops = JSON.stringify(layer.fill.stops);
            if (
                stops !== JSON.stringify(localStops) &&
                stops !== JSON.stringify(debouncedStops)
            ) {
                skipStopsSync.current = true;
                setLocalStops(layer.fill.stops as typeof localStops);
            }
        }
    }, [layer?.id, layer?.fill]);

    useEffect(() => {
        if (!layer) return;
        if (skipSolidSync.current) {
            skipSolidSync.current = false;
            return;
        }
        if (
            layer.fill.type === "solid" &&
            debouncedSolidColor !== layer.fill.color &&
            HEX_RE.test(debouncedSolidColor)
        ) {
            updateLayerFill(layer.id, {
                type: "solid",
                color: debouncedSolidColor,
            });
        }
    }, [debouncedSolidColor]);

    useEffect(() => {
        if (
            !layer ||
            layer.fill.type !== "gradient" ||
            !("stops" in layer.fill)
        )
            return;
        if (skipStopsSync.current) {
            skipStopsSync.current = false;
            return;
        }
        if (
            debouncedStops.length > 0 &&
            debouncedStops.every(s => HEX_RE.test(s.color)) &&
            JSON.stringify(debouncedStops) !== JSON.stringify(layer.fill.stops)
        ) {
            updateLayerFill(layer.id, {
                type: "gradient",
                stops: debouncedStops,
                angle: layer.fill.angle,
                gradientType: layer.fill.gradientType ?? "linear",
            });
        }
    }, [debouncedStops]);

    if (!layer) return null;

    const fill = layer.fill;

    return (
        <div className="border-b border-white/[0.07] pb-5">
            <div className="flex items-center justify-between px-3 py-3">
                <span className="text-xs font-semibold text-[#ebebf5]">
                    {t("inspector.color")}
                </span>
                <span className="text-2xs text-[#636366] bg-white/[0.07] px-1.5 py-0.5 rounded">
                    {t("common.all")}
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
                        ariaLabel={t("inspector.layerBlendMode")}
                        value={layer.blendMode}
                        onChange={v =>
                            updateLayer(layer.id, { blendMode: v as BlendMode })
                        }
                        options={BLEND_MODES}
                        className="flex-1"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#636366] w-16 shrink-0">
                            {t("common.fill")}
                        </span>
                        <Select
                            ariaLabel={t("inspector.fillType")}
                            value={fill.type}
                            onChange={v => {
                                if (v === "none")
                                    updateLayerFill(layer.id, { type: "none" });
                                else if (v === "solid") {
                                    setLocalSolidColor("#ffffff");
                                    updateLayerFill(layer.id, {
                                        type: "solid",
                                        color: "#ffffff",
                                    });
                                } else {
                                    const initialStops = [
                                        { offset: 0, color: "#ffffff" },
                                        { offset: 1, color: "#000000" },
                                    ];
                                    setLocalStops(initialStops);
                                    updateLayerFill(layer.id, {
                                        type: "gradient",
                                        stops: initialStops,
                                        angle: 90,
                                        gradientType: "linear",
                                    });
                                }
                            }}
                            options={FILL_TYPES}
                            className="flex-1"
                        />
                    </div>

                    {fill.type === "solid" && (
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-[#636366] w-16 shrink-0">
                                {t("inspector.color")}
                            </span>
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <ColorPicker
                                    label={t("inspector.fillColor")}
                                    value={localSolidColor}
                                    onChange={setLocalSolidColor}
                                />
                                <input
                                    type="text"
                                    aria-label={t("inspector.fillHex")}
                                    value={localSolidColor}
                                    onChange={e =>
                                        setLocalSolidColor(e.target.value)
                                    }
                                    className="min-w-0 flex-1 text-xs bg-white/[0.06] border border-white/[0.08] rounded-md px-1.5 py-0.5 text-[#ebebf5] focus:outline-hidden focus:border-[#0a84ff]"
                                />
                            </div>
                        </div>
                    )}

                    {fill.type === "gradient" && "stops" in fill && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#636366] w-16 shrink-0">
                                    {t("common.style")}
                                </span>
                                <Select
                                    ariaLabel={t("inspector.gradientStyle")}
                                    value={fill.gradientType ?? "linear"}
                                    onChange={v =>
                                        updateLayerFill(layer.id, {
                                            ...fill,
                                            gradientType: v as
                                                | "linear"
                                                | "radial",
                                        })
                                    }
                                    options={GRADIENT_TYPES}
                                    className="flex-1"
                                />
                            </div>
                            <div
                                className="w-full h-4 rounded-md"
                                style={{
                                    background:
                                        fill.gradientType === "radial"
                                            ? `radial-gradient(circle, ${localStops.map(s => `${s.color} ${s.offset * 100}%`).join(", ")})`
                                            : `linear-gradient(90deg, ${localStops.map(s => `${s.color} ${s.offset * 100}%`).join(", ")})`,
                                }}
                            />
                            {[0, 1].map(i => {
                                const stop = localStops[i] ?? {
                                    offset: i,
                                    color: i === 0 ? "#ffffff" : "#000000",
                                };
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 min-w-0">
                                        <ColorPicker
                                            label={t("inspector.gradientColor", { index: i + 1 })}
                                            value={stop.color}
                                            onChange={hex => {
                                                const newStops = [
                                                    ...localStops,
                                                ];
                                                newStops[i] = {
                                                    ...newStops[i],
                                                    color: hex,
                                                };
                                                setLocalStops(newStops);
                                            }}
                                        />
                                        <input
                                            type="text"
                                            aria-label={t("inspector.gradientHexColor", { index: i + 1 })}
                                            value={stop.color}
                                            onChange={e => {
                                                const newStops = [
                                                    ...localStops,
                                                ];
                                                newStops[i] = {
                                                    ...newStops[i],
                                                    color: e.target.value,
                                                };
                                                setLocalStops(newStops);
                                            }}
                                            className="flex-1 min-w-0 text-xs bg-white/[0.06] border border-white/[0.08] rounded-md px-1.5 py-0.5 text-[#ebebf5] focus:outline-hidden focus:border-[#0a84ff]"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
