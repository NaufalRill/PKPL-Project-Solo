import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function IndexWebsites() {
    const { t } = useLaravelReactI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('app.blog'),
            href: route('articles.index'),
        },
    ];

    return (
        <MainLayout
            title={t('app.articles_list')}
            breadcrumbs={breadcrumbs}
            rightNode={
                <Button variant="default" asChild>
                    <Link href={route('articles.create', { website: 'abc' })} prefetch>
                        {t('app.create_article')}
                    </Link>
                </Button>
            }
        >
            <Head title={t('app.articles_list')} />
        </MainLayout>
    );
}
