import { LayerTree } from '../layers/LayerTree';
import { t } from '../../i18n';

export function LeftPanel() {
  return (
    <aside aria-label={t('layers.title')} className="layer-sidebar flex flex-col min-h-0 shrink-0">
      <div className="flex-1 min-h-0">
        <LayerTree />
      </div>
    </aside>
  );
}
