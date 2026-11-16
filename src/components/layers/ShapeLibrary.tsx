import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@nanostores/react";
import {
    Circle,
    Diamond,
    Hexagon,
    Magnet,
    Minus,
    Plus,
    Rectangle,
    Shapes,
    Star,
    Triangle,
    UploadSimple,
    type Icon,
} from "@phosphor-icons/react";
import { addLayer } from "../../store/iconStore";
import { $snapEnabled } from "../../store/uiStore";
import customSymbolsFontUrl from "../../assets/fonts/Custom-SF-Symbols.ttf?url";
import { t, type MessageKey } from "../../i18n";

const PAGE_SIZE = 56;
// Keep printable low codepoints first to match font viewers, then the PUA block;
// control codepoints remain available at the end of the catalog.
const SYMBOL_CODEPOINTS = [
    ...Array.from({ length: 0x205 - 0x21 }, (_, index) => 0x21 + index),
    ...Array.from(
        { length: 0xfffe - 0xe900 + 1 },
        (_, index) => 0xe900 + index,
    ),
    ...Array.from({ length: 0x21 }, (_, index) => index),
];
const BUILT_IN_SHAPES: {
    nameKey: MessageKey;
    fileName: string;
    icon: Icon;
    svg: string;
}[] = [
    {
        nameKey: "shapeLibrary.shapes.rectangle",
        fileName: "rectangle.svg",
        icon: Rectangle,
        svg: '<rect x="192" y="192" width="640" height="640" rx="48"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.circle",
        fileName: "circle.svg",
        icon: Circle,
        svg: '<circle cx="512" cy="512" r="320"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.triangle",
        fileName: "triangle.svg",
        icon: Triangle,
        svg: '<path d="M512 160 880 832H144z"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.square",
        fileName: "square.svg",
        icon: Rectangle,
        svg: '<rect x="192" y="192" width="640" height="640"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.diamond",
        fileName: "diamond.svg",
        icon: Diamond,
        svg: '<path d="M512 112 912 512 512 912 112 512z"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.hexagon",
        fileName: "hexagon.svg",
        icon: Hexagon,
        svg: '<path d="M302 142h420l210 370-210 370H302L92 512z"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.star",
        fileName: "star.svg",
        icon: Star,
        svg: '<path d="m512 90 100 290h305L670 560l95 300-253-182-253 182 95-300L107 380h305z"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.plus",
        fileName: "plus.svg",
        icon: Plus,
        svg: '<path d="M432 128h160v304h304v160H592v304H432V592H128V432h304z"/>',
    },
    {
        nameKey: "shapeLibrary.shapes.line",
        fileName: "line.svg",
        icon: Minus,
        svg: '<path d="M192 512H832" fill="none" stroke="white" stroke-width="96" stroke-linecap="round"/>',
    },
];

export function ShapeLibrary() {
    const snapEnabled = useStore($snapEnabled);
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const faceRef = useRef<FontFace | null>(null);
    const urlRef = useRef<string | null>(null);
    const [fontFamily, setFontFamily] = useState<string | null>(null);
    const [fontName, setFontName] = useState<string | null>(null);
    const [isBundledFont, setIsBundledFont] = useState(false);
    const [fontError, setFontError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 12 });

    useEffect(() => {
        if (!open) return;
        const closeOnOutside = (event: PointerEvent) => {
            const target = event.target as Node;
            if (
                !rootRef.current?.contains(target) &&
                !popoverRef.current?.contains(target)
            )
                setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", closeOnOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);

    useEffect(
        () => () => {
            if (faceRef.current) document.fonts.delete(faceRef.current);
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        },
        [],
    );

    const installFont = (
        face: FontFace,
        objectUrl: string | null,
        label: string,
    ) => {
        if (faceRef.current) document.fonts.delete(faceRef.current);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        document.fonts.add(face);
        faceRef.current = face;
        urlRef.current = objectUrl;
        setFontFamily(face.family);
        setFontName(label);
        setPage(0);
        setSearch("");
        setFontError("");
    };

    const loadFont = async (file: Blob, label = t("shapeLibrary.customFont")) => {
        let nextUrl: string | null = null;
        setFontError("");
        try {
            const url = (nextUrl = URL.createObjectURL(file));
            const face = await new FontFace(
                `SymbolShapes-${Date.now()}`,
                `url("${url}")`,
            ).load();
            installFont(face, url, label);
            setIsBundledFont(false);
        } catch {
            if (nextUrl) URL.revokeObjectURL(nextUrl);
            setFontError(t("shapeLibrary.fontLoadError"));
        }
    };

    useEffect(() => {
        let cancelled = false;
        void new FontFace(
            `SymbolShapes-${Date.now()}`,
            `url("${customSymbolsFontUrl}")`,
        )
            .load()
            .then(face => {
                if (cancelled) return;
                installFont(face, null, t("shapeLibrary.bundledSymbols"));
                setIsBundledFont(true);
            })
            .catch(() => {
                if (!cancelled)
                    setFontError(t("shapeLibrary.bundledFontError"));
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const matchingGlyphs = SYMBOL_CODEPOINTS.filter(
        codepoint =>
            !search ||
            codepoint
                .toString(16)
                .includes(search.trim().replace(/^u\+?/i, "").toLowerCase()),
    );
    const pageCount = Math.ceil(matchingGlyphs.length / PAGE_SIZE);
    const visibleGlyphs = matchingGlyphs.slice(
        page * PAGE_SIZE,
        (page + 1) * PAGE_SIZE,
    );

    const addFontGlyph = (codepoint: number) => {
        if (!fontFamily) return;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1024;
        const context = canvas.getContext("2d");
        if (!context) return;
        const character = String.fromCodePoint(codepoint);
        const baseSize = 820;
        context.font = `${baseSize}px "${fontFamily}"`;
        const initial = context.measureText(character);
        const initialWidth =
            initial.actualBoundingBoxLeft + initial.actualBoundingBoxRight;
        const initialHeight =
            initial.actualBoundingBoxAscent + initial.actualBoundingBoxDescent;
        if (initialWidth < 1 || initialHeight < 1) {
            setFontError(
                t("shapeLibrary.glyphMissing", {
                    codepoint: codepoint.toString(16).toUpperCase(),
                }),
            );
            return;
        }
        const size =
            baseSize * Math.min(1, 840 / Math.max(initialWidth, initialHeight));
        context.font = `${size}px "${fontFamily}"`;
        const metrics = context.measureText(character);
        const width =
            metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
        const height =
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        context.fillStyle = "white";
        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        context.fillText(
            character,
            (1024 - width) / 2 + metrics.actualBoundingBoxLeft,
            (1024 - height) / 2 + metrics.actualBoundingBoxAscent,
        );
        canvas.toBlob(blob => {
            if (blob)
                addLayer(
                    URL.createObjectURL(blob),
                    `Symbol U+${codepoint.toString(16).toUpperCase()}.png`,
                    null,
                    100,
                );
        }, "image/png");
    };

    return (
        <div className="shape-library-anchor" ref={rootRef}>
            <button
                type="button"
                className="editor-icon-button"
                title={t("shapeLibrary.trigger")}
                aria-label={t("shapeLibrary.trigger")}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={event => {
                    if (!open) {
                        const rect =
                            event.currentTarget.getBoundingClientRect();
                        const panelWidth = Math.min(
                            360,
                            window.innerWidth - 24,
                        );
                        setPosition({
                            top: rect.bottom + 8,
                            left: Math.max(
                                12,
                                Math.min(
                                    rect.left,
                                    window.innerWidth - panelWidth - 12,
                                ),
                            ),
                        });
                    }
                    setOpen(value => !value);
                }}>
                <Shapes size={17} />
            </button>
            {open &&
                createPortal(
                    <div
                        ref={popoverRef}
                        className="shape-library-popover"
                        style={{ top: position.top, left: position.left }}
                        role="dialog"
                        aria-label={t("shapeLibrary.dialog")}>
                        <div className="shape-library-heading">
                            {t("shapeLibrary.heading")}
                        </div>
                        <div
                            className="shape-library-builtins"
                            role="group"
                            aria-label={t("shapeLibrary.basicShapes")}>
                            {BUILT_IN_SHAPES.map(
                                ({ nameKey, fileName, icon: Icon, svg }) => (
                                    <button
                                        key={nameKey}
                                        type="button"
                                        onClick={() => {
                                            const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><g fill="white">${svg}</g></svg>`;
                                            addLayer(
                                                URL.createObjectURL(
                                                    new Blob([image], {
                                                        type: "image/svg+xml",
                                                    }),
                                                ),
                                                fileName,
                                            );
                                        }}>
                                        <Icon size={18} /> {t(nameKey)}
                                    </button>
                                ),
                            )}
                        </div>
                        <button
                            type="button"
                            className="shape-library-snap"
                            aria-pressed={snapEnabled}
                            onClick={() => $snapEnabled.set(!snapEnabled)}>
                            <Magnet size={16} /> {t("shapeLibrary.snapToCenter")}{" "}
                            <span>{snapEnabled ? t("common.on") : t("common.off")}</span>
                        </button>
                        <div className="shape-library-font">
                            <div className="shape-library-section-title">
                                {fontName ?? t("shapeLibrary.bundledSymbols")}
                            </div>
                            <p>
                                {isBundledFont
                                    ? t("shapeLibrary.bundledDescription")
                                    : t("shapeLibrary.customDescription")}
                            </p>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}>
                                <UploadSimple size={16} /> {t("shapeLibrary.useAnotherFont")}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".ttf,.otf,font/ttf,font/otf"
                                hidden
                                onChange={event => {
                                    const file = event.target.files?.[0];
                                    if (file) void loadFont(file, file.name);
                                    event.currentTarget.value = "";
                                }}
                            />
                            {fontError && (
                                <div
                                    className="shape-library-error"
                                    role="status">
                                    {fontError}
                                </div>
                            )}
                        </div>
                        {fontFamily && (
                            <>
                                <input
                                    className="shape-library-search"
                                    type="search"
                                    value={search}
                                    placeholder={t("shapeLibrary.searchPlaceholder")}
                                    aria-label={t("shapeLibrary.searchAria")}
                                    onChange={event => {
                                        setSearch(event.target.value);
                                        setPage(0);
                                    }}
                                />
                                <div className="shape-library-pagination">
                                    <button
                                        type="button"
                                        disabled={page === 0}
                                        onClick={() =>
                                            setPage(value => value - 1)
                                        }>
                                        {t("common.previous")}
                                    </button>
                                    <span>
                                        {matchingGlyphs.length
                                            ? t("shapeLibrary.range", {
                                                  start: page * PAGE_SIZE + 1,
                                                  end: Math.min(
                                                      (page + 1) * PAGE_SIZE,
                                                      matchingGlyphs.length,
                                                  ),
                                                  total: matchingGlyphs.length,
                                              })
                                            : t("common.noMatches")}{" "}
                                        · {t("shapeLibrary.page", {
                                            page: pageCount ? page + 1 : 0,
                                            total: pageCount,
                                        })}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={page >= pageCount - 1}
                                        onClick={() =>
                                            setPage(value => value + 1)
                                        }>
                                        {t("common.next")}
                                    </button>
                                </div>
                                <div
                                    className="shape-library-grid"
                                    aria-label={t("shapeLibrary.glyphGrid")}>
                                    {visibleGlyphs.map(codepoint => (
                                        <button
                                            key={codepoint}
                                            type="button"
                                            style={{ fontFamily }}
                                            title={t("shapeLibrary.addGlyph", {
                                                codepoint: codepoint
                                                    .toString(16)
                                                    .toUpperCase(),
                                            })}
                                            aria-label={t("shapeLibrary.addGlyph", {
                                                codepoint: codepoint
                                                    .toString(16)
                                                    .toUpperCase(),
                                            })}
                                            onClick={() =>
                                                addFontGlyph(codepoint)
                                            }>
                                            {String.fromCodePoint(codepoint)}
                                            <span>
                                                {codepoint
                                                    .toString(16)
                                                    .toUpperCase()}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
}
