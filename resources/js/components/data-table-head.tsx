import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { Button } from './ui/button';

import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export default function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 text-sm data-[state=open]:bg-accent"
                onClick={() => {
                    if (column.getIsSorted() === 'asc') {
                        column.toggleSorting(true);
                    } else {
                        column.toggleSorting(false);
                    }
                }}
            >
                <span>{title}</span>
                {column.getIsSorted() === 'desc' ? <ArrowDown /> : column.getIsSorted() === 'asc' ? <ArrowUp /> : <ChevronsUpDown />}
            </Button>
        </div>
    );
}
