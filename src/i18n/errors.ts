import { t } from './index';

const IMPORT_ERROR_MAP: Record<string, string> = {
  'No icon.json found in the archive.': t('importExport.noIconJson'),
  'icon.json is not a valid Icon Composer document.': t('importExport.invalidIconJson'),
  'This document uses features from a newer version of Icon Composer':
    t('importExport.newerFeatures'),
  'Could not create a canvas for the radial fill asset.':
    t('importExport.createRadialFillCanvas'),
  'Could not encode the radial fill asset.': t('importExport.encodeRadialFill'),
  'Could not encode the radial background asset.':
    t('importExport.encodeRadialBackground'),
  'WebGL2 not supported': t('importExport.webgl2NotSupported'),
};

export function translateImportError(detail: string): string {
  return IMPORT_ERROR_MAP[detail] ?? detail;
}

export function importErrorMessage(detail: string): string {
  return t('importExport.importError', { detail: translateImportError(detail) });
}
