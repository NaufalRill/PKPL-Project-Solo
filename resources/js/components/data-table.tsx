'use client';

import { ColumnDef, flexRender, getCoreRowModel, PaginationState, SortingState, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export interface DataTableStates {
    pagination?: PaginationState;
    searchKeyword?: string;
    sorting?: SortingState;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data?: TData[];
    rowCount?: number;
    searchBar?: {
        placeholder: string;
    };
    onChange?: (states: DataTableStates) => void;
}

export function DataTable<TData, TValue>({ columns, data: sourceData, rowCount, searchBar, onChange }: DataTableProps<TData, TValue>) {
    const PAGE_SIZE = 10;

    const { t } = useLaravelReactI18n();

    function calculateFrom(pageIndex: number, rowCount: number) {
        const from = PAGE_SIZE * pageIndex + 1;
        if (from > rowCount) {
            return rowCount;
        }
        return from;
    }

    const calculateTo = useCallback((pageIndex: number, rowCount: number) => {
        const from = calculateFrom(pageIndex, rowCount);
        const to = from + PAGE_SIZE - 1;
        if (to > rowCount) {
            return rowCount;
        }
        return to;
    }, []);

    const [data, setData] = useState<TData[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
    const [from, setFrom] = useState<number>();
    const [to, setTo] = useState<number>();

    let searchTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        onSortingChange: setSorting,
        manualFiltering: true,
        manualPagination: true,
        onPaginationChange: setPagination,
        rowCount: rowCount,
        state: {
            sorting,
            pagination,
        },
    });

    useEffect(() => {
        onChange?.({ pagination, searchKeyword, sorting });
    }, [pagination, searchKeyword, sorting, onChange]);

    useEffect(() => {
        if (rowCount === undefined) {
            return;
        }

        setFrom(calculateFrom(pagination.pageIndex, rowCount));
        setTo(calculateTo(pagination.pageIndex, rowCount));
    }, [pagination, rowCount, calculateTo]);

    useEffect(() => {
        if (sourceData === undefined) {
            return;
        }
        setData(sourceData);
    }, [sourceData]);

    return (
        <div>
            <div className="flex items-center py-4">
                {searchBar && (
                    <Input
                        placeholder={searchBar.placeholder}
                        onChange={(event) => {
                            if (searchTimeout) {
                                clearTimeout(searchTimeout);
                            }
                            searchTimeout = setTimeout(() => {
                                setSearchKeyword(event.target.value);
                                searchTimeout = undefined;
                            }, 500);
                        }}
                        className="max-w-72"
                        disabled={sourceData === undefined}
                    />
                )}
            </div>

            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className={cn(header.column.columnDef.meta?.headClass)}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                {sourceData === undefined ? (
                    <TableBody>
                        {Array.from({ length: PAGE_SIZE }).map((_, row) => (
                            <TableRow key={'body-row-' + row}>
                                {Array.from({ length: columns.length }).map((_, col) => (
                                    <TableCell key={`body-col-${row}-${col}`}>
                                        <ShadowLoading className="h-8"></ShadowLoading>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                ) : (
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.cellClass)}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t('app.table.no_results')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                )}
            </Table>

            {sourceData === undefined || from === undefined || to === undefined || rowCount === undefined ? (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
                    <ShadowLoading className="h-5 w-full max-w-60"></ShadowLoading>

                    <div className="flex w-full max-w-60 items-center justify-end space-x-2">
                        <ShadowLoading className="h-7 flex-1"></ShadowLoading>
                        <ShadowLoading className="h-7 flex-1"></ShadowLoading>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                        {t('app.table.show_to_from_records', { from: from, to: to, count: rowCount })}
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            {t('app.table.previous')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            {t('app.table.next')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ShadowLoading({ className }: { className: string }) {
    return <div className={cn('h-4 animate-pulse rounded-sm bg-black/10 dark:bg-white/5', className)}></div>;
}

export function DataTableLoading({ cols, rows, searchBar }: { cols: number; rows: number; searchBar?: boolean }) {
    return (
        <div>
            <div className="flex items-center py-4">{searchBar && <ShadowLoading className="h-7 w-full max-w-72" />}</div>

            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: cols }).map((_, index) => (
                            <TableHead key={'head-col-' + index}>
                                <ShadowLoading className="h-7"></ShadowLoading>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, row) => (
                        <TableRow key={'body-row-' + row}>
                            {Array.from({ length: cols }).map((_, col) => (
                                <TableCell key={`body-col-${row}-${col}`}>
                                    <ShadowLoading className="h-8"></ShadowLoading>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
                <ShadowLoading className="h-5 w-full max-w-60"></ShadowLoading>

                <div className="flex w-full max-w-60 items-center justify-end space-x-2">
                    <ShadowLoading className="h-7 flex-1"></ShadowLoading>
                    <ShadowLoading className="h-7 flex-1"></ShadowLoading>
                </div>
            </div>
        </div>
    );
}
