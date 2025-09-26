import DataTableClient from '@/components/clients/data-client-table-columns';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function () {
    const { t } = useLaravelReactI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('app.clients'),
            href: route('clients.index'),
        },
    ];

    return (
        <MainLayout
            title={t('app.clients_list')}
            breadcrumbs={breadcrumbs}
            rightNode={
                <Button variant="default" asChild>
                    <Link href={route('clients.create')} prefetch>
                        {t('app.create_client')}
                    </Link>
                </Button>
            }
        >
            <Head title={t('app.clients_list')} />

            <DataTableClient />
        </MainLayout>
    );
}
