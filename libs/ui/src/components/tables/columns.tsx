import type { ColumnDef } from '@tanstack/react-table';
import type { EntityName, View } from '@cavok/core/domain/shared/entities.values';
import { ButtonProps } from '../shad/button';
import { planeColumns } from './entities/plane.columns';

export const columnRegistry = {
  plane: {
    entityList: planeColumns,
  },
  fleet: {
    entityList: planeColumns,
  },
};
