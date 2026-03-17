import type { PlaneDetails } from '@cavok/core/contracts/plane.contracts';
import type { PlaneCategory } from '@cavok/core/domain/plane/plane.values';
import { useColumnBuilder } from '@cavok/ui/components/tables/column-builder';
import { SortableHeader } from '@cavok/ui/components/tables/components/sortable-header';
import { useTranslation } from 'react-i18next';

export function usePlaneDetailsColumns() {
  const { t } = useTranslation();

  const columns = useColumnBuilder<PlaneDetails>({
    selectable: false,
    columns: [
      {
        accessorKey: 'name',
        enableSorting: true,
        sortingFn: 'alphanumeric',
        header: ({ column }) => (
          <SortableHeader label={t('entity.plane.prop.name')} column={column} />
        ),
      },
      {
        accessorKey: 'registration',
        sortingFn: 'alphanumeric',
        header: ({ column }) => (
          <SortableHeader label={t('entity.plane.prop.registration')} column={column} />
        ),
      },
      {
        accessorKey: 'category',
        sortingFn: 'alphanumeric',
        header: ({ column }) => (
          <SortableHeader label={t('entity.plane.prop.category')} column={column} />
        ),
        cell: ({ column, cell }) => {
          const value = cell.getValue() as PlaneCategory;
          return <p>{t(`entity.plane.prop.categories.${value}`)}</p>;
        },
      },
    ],
    translations: {},
  });

  return columns;
}
