import { ColumnDef } from '@tanstack/react-table';
import { PlaneDetails } from '@cavok/core/contracts/plane.contracts';
import { SortableHeader } from './components/sortable-header';
import { selectColumn } from './components/select-column';
import { useMemo } from 'react';

export type ColumnBuilderOptions<T> = {
  selectable: boolean;
  columns: ColumnDef<T>[];
  translations: {
    selectAll?: string;
    selectRow?: string;
    [key: string]: string | undefined;
  };
};

export function useColumnBuilder<T>({
  selectable,
  columns,
}: ColumnBuilderOptions<T>): ColumnDef<T>[] {
  return useMemo(() => {
    const baseCols = [] as ColumnDef<T>[];

    if (selectable) {
      baseCols.push(selectColumn as unknown as ColumnDef<T>);
    }

    return [...baseCols, ...columns] satisfies ColumnDef<T>[];
  }, [selectable, columns]);
}
