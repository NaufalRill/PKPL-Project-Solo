import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { delay } from '@/lib/utils';
import { Client, PaginationMeta } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { AlertTriangle, CheckCircle2, Globe, MoreHorizontal } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { DataTable, DataTableStates } from '../data-table';
import DataTableColumnHeader from '../data-table-head';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

type DeletedInfo = { open: boolean; name?: string };

// Komponen terpisah untuk menangani delete dialog
function DeleteClientDialog({
    client,
    onDelete,
    isDeleting,
}: {
    client: Client;
    onDelete: (clientId: string, clientName: string) => void;
    isDeleting: boolean;
}) {
    const { t } = useLaravelReactI18n();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    onSelect={(e) => {
                        e.preventDefault();
                        setDeleteDialogOpen(true);
                    }}
                >
                    {t('app.delete')}
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>{t('app.delete_client_account')}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        {t('app.delete_client_account_confirmation')} "{client.user?.name}"?
                    </p>
                    <p className="text-xs text-red-600">{t('app.delete_client_account_confirmation_description')}</p>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            {t('app.cancel')}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDelete(client.id, client.user?.name || 'Unknown');
                                setDeleteDialogOpen(false);
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('app.delete_process') : t('app.delete')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DeleteSuccessDialog({ open, onOpenChange }: { open: boolean; name?: string; onOpenChange: (open: boolean) => void }) {
    const { t } = useLaravelReactI18n();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{t('app.delete_client_success')}</span>
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
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [data, setData] = useState<Client[]>();
    const [rowCount, setRowCount] = useState<number>();
    const [deletedInfo, setDeletedInfo] = useState<DeletedInfo>({ open: false });
    const refreshTableRef = useRef<(() => void) | null>(null);

    const handleDeleteClient = (clientId: string, clientName?: string) => {
        setIsDeleting(clientId);

        router.delete(route('clients.destroy', { client: clientId }), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsDeleting(null);

                if (refreshTableRef.current) {
                    refreshTableRef.current();
                }

                setTimeout(() => {
                    setDeletedInfo({ open: true, name: clientName });
                }, 100);
            },
            onError: () => {
                setIsDeleting(null);
                setDeletedInfo({ open: true, name: undefined });
            },
        });
    };

    const columns: ColumnDef<Client>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return <DataTableColumnHeader column={column} className="sticky left-0" title={t('app.name')} />;
            },
            cell: ({ row }) => {
                const user = row.original.user;
                return <span className="text-foreground">{user?.name}</span>;
            },
            meta: {
                headClass: 'sticky left-0 bg-background max-w-48 truncate',
                cellClass: 'sticky left-0 bg-background max-w-48 truncate',
            },
        },
        {
            accessorKey: 'contact',
            header: t('app.contact'),
            cell: ({ row }) => {
                const { contact } = row.original;
                return <span className="text-muted-foreground">{contact}</span>;
            },
            meta: {
                headClass: 'max-w-48 truncate',
                cellClass: 'max-w-48 truncate',
            },
        },
        {
            accessorKey: 'email',
            header: t('app.email'),
            cell: ({ row }) => {
                const user = row.original.user;
                return <span className="text-foreground">{user?.email}</span>;
            },
            meta: {
                headClass: 'max-w-48 truncate',
                cellClass: 'max-w-48 truncate',
            },
        },
        {
            accessorKey: 'website_access',
            header: t('app.website_access'),
            cell: ({ row }) => {
                const { websites } = row.original;
                if (!websites || websites.length === 0) {
                    return <div className="text-muted-foreground">{t('app.no_accessible_website')}</div>;
                }
                return (
                    <div className="flex justify-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="default" size="sm">
                                    View
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                        <Globe className="h-5 w-5" />
                                        <span>{t('app.website_access')}</span>
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="flex flex-col space-y-3 pt-4">
                                    {websites?.map((website) => (
                                        <div key={website.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-semibold">{website.name}</p>
                                                <a
                                                    href={`https://${website.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    {website.url}
                                                </a>
                                            </div>
                                            <p className="font-mono text-xs text-muted-foreground">{website.id}</p>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: t('app.actions'),
            cell: ({ row }) => {
                const client = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t('app.open_menu')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Option Edit */}
                            <DropdownMenuItem asChild>
                                <Link href={route('clients.edit', { client: client.id })} className="w-full">
                                    {t('app.edit')}
                                </Link>
                            </DropdownMenuItem>

                            {/* Option Delete */}
                            <DeleteClientDialog client={client} onDelete={handleDeleteClient} isDeleting={isDeleting === client.id} />
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

    const fetchClient = useCallback(async ({ states }: { states?: DataTableStates }): Promise<{ data: Client[]; meta: PaginationMeta }> => {
        const sorting = states?.sorting?.at(0);
        await delay();

        const response = await fetch(
            route('clients.list', {
                page: states?.pagination ? states.pagination.pageIndex + 1 : undefined,
                keyword: states?.searchKeyword || null,
                order_by: sorting?.id,
                order_dir: sorting ? (sorting.desc ? 'desc' : 'asc') : null,
            }),
        );

        const jsonResponse = await response.json();
        return jsonResponse;
    }, []);

    const fetchData = useCallback(
        async (states: DataTableStates) => {
            setData(undefined);
            const { data, meta } = await fetchClient({ states });
            setData(data);
            setRowCount(meta.total);
        },
        [fetchClient],
    );

    const handleTableChange = useCallback(
        (states: DataTableStates) => {
            fetchData(states);
            refreshTableRef.current = () => fetchData(states);
        },
        [fetchData],
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                rowCount={rowCount}
                searchBar={{ placeholder: t('app.search_by_client') }}
                onChange={handleTableChange}
            />

            <DeleteSuccessDialog open={deletedInfo.open} name={deletedInfo.name} onOpenChange={(open) => setDeletedInfo((s) => ({ ...s, open }))} />
        </>
    );
}
