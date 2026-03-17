import type { PlaneDetails } from '@cavok/core/contracts/plane.contracts';
import type { View } from '@cavok/core/domain/shared/entities.values';
import type { ColumnDef } from '@cavok/ui/components/tables/table';
import { SortableHeader } from '@cavok/ui/components/tables/components/sortable-header';

export const getPlaneDetailsColumns = ({ t }: { t: (key: string) => string }) =>
  [
    {
      accessorKey: 'name',
      enableSorting: true,
      sortingFn: 'alphanumeric',
      header: ({ column }) => <SortableHeader label="Name" column={column} />,
    },
    {
      accessorKey: 'registration',
      sortingFn: 'alphanumeric',
      header: ({ column }) => <SortableHeader label="Registration" column={column} />,
    },
    {
      accessorKey: 'category',
      sortingFn: 'alphanumeric',
      header: ({ column }) => <SortableHeader label="Category" column={column} />,
    },
  ] satisfies ColumnDef<PlaneDetails>[];
