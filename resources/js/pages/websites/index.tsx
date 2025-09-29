
import DataTable from '@/components/websites/data-table';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head} from '@inertiajs/react';
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

        >
            <Head title={t('app.websites_list')} />

            <DataTable />
        </MainLayout>
    );
}
