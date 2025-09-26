import ArticleEditor from '@/components/article-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function () {
    const { t } = useLaravelReactI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('app.blog'),
            href: route('articles.index'),
        },
        {
            title: t('app.edit_article'),
            href: route('articles.edit', { website: 'abc', article: 'abc' }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('app.edit_article')} />

            <div className="flex h-full flex-1 gap-4 divide-x overflow-x-auto rounded-xl p-4">
                <div className="@container flex-1">
                    <ArticleEditor />
                </div>
                <div className="flex max-w-sm flex-1 flex-col">
                    <div className="flex items-center justify-between gap-4">
                        <Badge>Draft</Badge>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline">Publish</Button>
                            <Button>Save draft</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
