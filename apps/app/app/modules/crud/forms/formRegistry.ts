import type { EntityName } from '@cavok/core/domain/shared/entities.values';
import type i18n from '~/i18n';
import { planeForm, type CrudFormConfig } from '~/modules/planes/forms/plane.forms';

export const formRegistry = {
  plane: planeForm,
  fleet: planeForm,
} satisfies Record<EntityName, (t: typeof i18n.t) => CrudFormConfig>;
