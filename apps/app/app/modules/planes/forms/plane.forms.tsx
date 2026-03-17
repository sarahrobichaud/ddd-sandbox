import z from 'zod';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { planeCategories, type PlaneCategory } from '@cavok/core/domain/plane/plane.values';
import i18n from '~/i18n';

export type FieldOption = { label: string; value: string };

export type FieldConfig =
  | {
      name: string;
      placeholder?: string;
      label: string;
      type?: 'text' | 'email' | 'number';
      required?: boolean;
    }
  | {
      name: string;
      label: string;
      placeholder?: string;
      type: 'select';
      options: FieldOption[];
      required?: boolean;
    }
  | {
      name: string;
      label: string;
      type: 'hidden';
    };

export type CrudFormConfig = {
  fields: FieldConfig[];
  schema: Record<string, StandardSchemaV1>;
};

export const planeForm = (t: typeof i18n.t) =>
  ({
    fields: [
      {
        name: 'name',
        type: 'text',
        label: t('entity.plane.prop.name'),
        placeholder: 'Airbus A320',
        required: true,
      },
      {
        name: 'registration',
        placeholder: 'KDE2342',
        type: 'text',
        label: t('entity.plane.prop.registration'),
        required: false,
      },
      {
        type: 'select',
        options: planeCategories.map((type: PlaneCategory) => {
          return {
            label: t(`entity.plane.prop.categories.${type}`),
            value: type,
          };
        }),
        label: i18n.t('entity.plane.prop.category'),
        name: 'category',
      },
    ],
    schema: {
      create: z.object({
        name: z.string().min(5),
        registration: z.string(),
        category: z.enum(planeCategories),
      }),
      update: z
        .object({
          name: z.string().min(5),
          registration: z.string(),
          category: z.enum(planeCategories),
        })
        .partial(),
    },
  }) satisfies CrudFormConfig;
