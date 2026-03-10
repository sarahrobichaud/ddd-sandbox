import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
} from '@tanstack/react-table';

import { columnRegistry } from './columns';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '../shad/table';
import type { EntityName, View } from '@cavok/core/domain/shared/entities.values';
import { ReactNode, useState } from 'react';
import { TablePagination } from './table-pagination';
import { Input } from '../shad/input';
import { useT } from '@cavok/ui/i18n/i18n';
export type { ColumnDef } from '@tanstack/react-table';

export type BasicTableProps = {
  data: any[];
  entity: EntityName;
  view: View;
  columns: ColumnDef<any>[];
  idKey?: string;
  selectable?: boolean;
  renderActions?: (id: string) => ReactNode;
};

export function HorizonFSTable({
  data,
  entity,
  columns,
  view,
  renderActions,
  idKey = 'id',
  selectable = false,
}: BasicTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const t = useT();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 4,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder={t('components.dataTable.search.searchByProp', {
            prop: t('components.dataTable.search.prop.name'),
          })}
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} id={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
              {renderActions && <TableHead></TableHead>}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell className="">{renderActions(row.original[idKey])}</TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="pt-4">
        <TablePagination table={table} selectable={selectable} />
      </div>
    </>
  );
}
