import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function () {
    const { t } = useLaravelReactI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('app.forms'),
            href: route('forms.index'),
        },
        {
            title: t('app.edit_form'),
            href: route('forms.edit', { website: 'abc', form: 'abc' }),
        },
    ];

    return (
        <MainLayout breadcrumbs={breadcrumbs} title={t('app.edit_form')}>
            <Head title={t('app.edit_form')} />
        </MainLayout>
    );
}
