import type { ColumnDef } from '@cavok/ui/components/tables/table';
import { usePlaneDetailsColumns } from '../planes/tables/use-plane-details-columns';
import type { EntityName } from './constants';

export const tableRegistry = {
  plane: {
    useDetailsColumns: usePlaneDetailsColumns,
  },
  fleet: {
    useDetailsColumns: usePlaneDetailsColumns,
  },
} satisfies Record<
  EntityName,
  {
    useDetailsColumns: () => ColumnDef<any>[];
  }
>;
