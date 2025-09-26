import { DataTable, DataTableStates } from '../data-table';

import DataTableColumnHeader from '@/components/data-table-head';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { delay } from '@/lib/utils';
import { PaginationMeta, Website } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

type DeletedInfo = { open: boolean; name?: string };

// ---- Dialog konfirmasi hapus Website (adaptasi dari DeleteClientDialog) ----
function DeleteWebsiteDialog({
    website,
    onDelete,
    isDeleting,
}: {
    website: Website;
    onDelete: (websiteId: string, websiteName: string) => void;
    isDeleting: boolean;
}) {
    const { t } = useLaravelReactI18n();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    onSelect={(e) => {
                        e.preventDefault();
                        setOpen(true);
                    }}
                >
                    {t('app.delete')}
                </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>{t('app.delete_website') || 'Delete Website'}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        {(t('app.delete_website_confirmation') as string) || 'Are you sure you want to delete this website'} “{website.name}”?
                    </p>
                    <p className="text-xs text-red-600">
                        {(t('app.delete_website_confirmation_description') as string) ||
                            'This action cannot be undone and may remove related access.'}
                    </p>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                            {t('app.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => {
                                onDelete(website.id as unknown as string, website.name || 'Unknown');
                                setOpen(false);
                            }}
                        >
                            {isDeleting ? (t('app.delete_process') as string) || 'Deleting…' : t('app.delete')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ---- Dialog sukses hapus (adaptasi dari DeleteSuccessDialog) ----
function DeleteSuccessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { t } = useLaravelReactI18n();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{(t('app.delete_website_success') as string) || 'Website deleted successfully'}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex min-w-0 items-center justify-center">
                    <Button onClick={() => onOpenChange(false)}>{t('app.close')}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function () {
    const { t } = useLaravelReactI18n();

    const columns: ColumnDef<Website, { class: string }>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} className="sticky left-0" title={t('app.name')} />;
            },
            meta: {
                headClass: 'sticky left-0 bg-background max-w-48 truncate',
                cellClass: 'sticky left-0 bg-background max-w-48 truncate',
            },
        },
        {
            accessorKey: 'url',
            header: t('app.url'),
            cell: ({ row }) => {
                const { url } = row.original;
                return (
                    <a href={url} target="_blank" className="text-primary hover:underline">
                        {url}
                    </a>
                );
            },
            meta: {
                headClass: 'max-w-48 truncate',
                cellClass: 'max-w-48 truncate',
            },
        },
        {
            accessorKey: 'clients',
            header: t('app.clients'),
            cell: ({ row }) => {
                const { clients } = row.original;
                if (clients === undefined || clients.length === 0) {
                    return t('app.no_client_has_been_added');
                }

                return clients.map(({ name }) => name).join(', ');
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={t('app.status')} />;
            },
            cell: ({ row }) => {
                const { status } = row.original;
                const statuses = {
                    active: <Badge>{t('app.active')}</Badge>,
                    inactive: <Badge variant="secondary">{t('app.inactive')}</Badge>,
                };
                return statuses[status];
            },
        },
        {
            accessorKey: 'deployedAt',
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} title={t('app.deployed_at')} />;
            },
            cell: ({ row }) => {
                const { deployedAt } = row.original;
                if (deployedAt === undefined) {
                    return '-';
                }
                return new Date(deployedAt).toLocaleDateString();
            },
        },
        {
            id: 'actions',
            header: t('app.actions'),
            cell: ({ row }) => {
                const website = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t('app.open_menu')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Link href={route('websites.edit', { website: website.id })} className="w-full">
                                    {t('app.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DeleteWebsiteDialog website={website} onDelete={handleDeleteWebsite} isDeleting={isDeleting === website.id} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            meta: {
                headClass: 'sticky right-0 bg-background',
                cellClass: 'sticky right-0 bg-background',
            },
        },
    ];

    const [data, setData] = useState<Website[]>();
    const [rowCount, setRowCount] = useState<number>();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deletedInfo, setDeletedInfo] = useState<DeletedInfo>({ open: false });
    const refreshTableRef = useRef<(() => void) | null>(null);

    const fetchWebsites: ({ states }: { states?: DataTableStates | undefined }) => Promise<{ data: Website[]; meta: PaginationMeta }> = async ({
        states,
    }: {
        states?: DataTableStates | undefined;
    }) => {
        const sorting = states?.sorting?.at(0);
        await delay();

        const response = await fetch(
            route('websites.list', {
                page: states?.pagination ? states.pagination.pageIndex + 1 : undefined,
                keyword: states?.searchKeyword || null,
                order_by: sorting?.id,
                order_dir: sorting ? (states?.sorting?.at(0)?.desc ? 'desc' : 'asc') : null,
            }),
        );

        const jsonResponse = await response.json();
        return jsonResponse;
    };

    const fetchData = useCallback(async (states: DataTableStates) => {
        setData(undefined);
        const { data, meta } = await fetchWebsites({ states });
        setData(data);
        setRowCount(meta.total);
    }, []);

    const handleTableChange = useCallback(
        (states: DataTableStates) => {
            fetchData(states);
            refreshTableRef.current = () => fetchData(states);
        },
        [fetchData],
    );

    // ---- Hapus website via Inertia, lalu tampilkan dialog sukses ----
    const handleDeleteWebsite = (websiteId: string, websiteName?: string) => {
        setIsDeleting(websiteId);

        router.delete(route('websites.destroy', { website: websiteId }), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsDeleting(null);
                if (refreshTableRef.current) {
                    refreshTableRef.current();
                }
                setTimeout(() => {
                    setDeletedInfo({ open: true, name: websiteName });
                }, 100);
            },
            onError: () => {
                setIsDeleting(null);
                setDeletedInfo({ open: true, name: undefined });
            },
        });
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                rowCount={rowCount}
                searchBar={{ placeholder: t('app.search_by_website') }}
                onChange={handleTableChange}
            />

            <DeleteSuccessDialog open={deletedInfo.open} onOpenChange={(open) => setDeletedInfo((s) => ({ ...s, open }))} />
        </>
    );
}
