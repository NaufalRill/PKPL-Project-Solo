import { Button } from '@/components/ui/button';
import DataTable from '@/components/websites/data-table';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function () {
    const { t } = useLaravelReactI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('app.websites'),
            href: route('websites.index'),
        },
    ];

    return (
        <MainLayout
            title={t('app.websites_list')}
            breadcrumbs={breadcrumbs}
            rightNode={
                <Button variant="default" asChild>
                    <Link href={route('websites.create')} prefetch>
                        {t('app.create_website')}
                    </Link>
                </Button>
            }
        >
            <Head title={t('app.websites_list')} />

            <DataTable />
        </MainLayout>
    );
}
