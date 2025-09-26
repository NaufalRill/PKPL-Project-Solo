import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function () {
    const { t } = useLaravelReactI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('app.forms'),
            href: route('forms.index'),
        },
    ];

    return (
        <MainLayout
            title={t('app.forms_list')}
            breadcrumbs={breadcrumbs}
            rightNode={
                <Button variant="default" asChild>
                    <Link href={route('forms.create', { website: 'abc' })} prefetch>
                        {t('app.create_form')}
                    </Link>
                </Button>
            }
        >
            <Head title={t('app.forms_list')} />
        </MainLayout>
    );
}
