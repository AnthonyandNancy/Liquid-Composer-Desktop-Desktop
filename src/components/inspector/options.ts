import type { MessageKey } from '../../i18n';
import type { BlendMode } from '../../types/index';

export const BLEND_MODE_OPTIONS: { value: BlendMode; labelKey: MessageKey }[] = [
  { value: 'normal', labelKey: 'inspector.blendModes.normal' },
  { value: 'multiply', labelKey: 'inspector.blendModes.multiply' },
  { value: 'screen', labelKey: 'inspector.blendModes.screen' },
  { value: 'overlay', labelKey: 'inspector.blendModes.overlay' },
  { value: 'darken', labelKey: 'inspector.blendModes.darken' },
  { value: 'lighten', labelKey: 'inspector.blendModes.lighten' },
  { value: 'color-dodge', labelKey: 'inspector.blendModes.colorDodge' },
  { value: 'color-burn', labelKey: 'inspector.blendModes.colorBurn' },
  { value: 'hard-light', labelKey: 'inspector.blendModes.hardLight' },
  { value: 'soft-light', labelKey: 'inspector.blendModes.softLight' },
  { value: 'difference', labelKey: 'inspector.blendModes.difference' },
  { value: 'exclusion', labelKey: 'inspector.blendModes.exclusion' },
  { value: 'plus-lighter', labelKey: 'inspector.blendModes.plusLighter' },
];

export const FILL_TYPE_OPTIONS: { value: 'none' | 'solid' | 'gradient'; labelKey: MessageKey }[] = [
  { value: 'none', labelKey: 'inspector.fillTypes.none' },
  { value: 'solid', labelKey: 'inspector.fillTypes.solid' },
  { value: 'gradient', labelKey: 'inspector.fillTypes.gradient' },
];

export const GRADIENT_TYPE_OPTIONS: { value: 'linear' | 'radial'; labelKey: MessageKey }[] = [
  { value: 'linear', labelKey: 'inspector.gradientTypes.linear' },
  { value: 'radial', labelKey: 'inspector.gradientTypes.radial' },
];
