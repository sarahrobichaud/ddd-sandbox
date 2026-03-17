import { useOutletContext } from 'react-router';
import type { EntityCrudViewContext } from '.';

export function useEntityCrudView() {
  return useOutletContext<EntityCrudViewContext>();
}
