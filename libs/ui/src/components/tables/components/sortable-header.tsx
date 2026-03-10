import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { createElement } from 'react';
import { Button } from '../../shad/button';
import clsx from 'clsx';
import { Column } from '@tanstack/react-table';

export function SortableHeader({ label, column }: { label: string; column: Column<any, any> }) {
  const isAscending = column.getIsSorted() === 'asc';
  const isDescending = column.getIsSorted() === 'desc';

  const icon = () => {
    if (isAscending) {
      return ArrowDown;
    } else if (isDescending) {
      return ArrowUp;
    } else {
      return ArrowUpDown;
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <span>{label}</span>
      <Button variant="ghost" size={'icon'} onClick={() => column.toggleSorting(isAscending)}>
        {createElement(icon(), {
          className: clsx('h-2 w-2', {
            'text-primary': isAscending || isDescending,
          }),
        })}
      </Button>
    </div>
  );
}
