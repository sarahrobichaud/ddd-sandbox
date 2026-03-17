import z from 'zod';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { planeCategories } from '@cavok/core/domain/plane/plane.values';

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

export const planeForm = {
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      placeholder: 'Airbus A320',
      required: true,
    },
    {
      name: 'registration',
      placeholder: 'KDE2342',
      type: 'text',
      label: 'Registration',
      required: false,
    },
    {
      type: 'select',
      options: planeCategories.map((type) => {
        return { label: type, value: type };
      }),
      label: 'Category',
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
} satisfies CrudFormConfig;
