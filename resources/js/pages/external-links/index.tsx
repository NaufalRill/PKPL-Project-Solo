import { DataTableLoading } from '@/components/data-table';
import { useWebsiteContext } from '@/components/website-switcher';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import * as React from 'react';

// Komponen konten yang baru dipisah
import DataExternalLinks from '@/components/external-links/data-external-links';

export default function ExternalLinksIndexPage(): React.ReactElement {
    const { website } = useWebsiteContext();
    const { t } = useLaravelReactI18n();

    const pageState = React.useMemo(() => {
        if (website === undefined) return 'loading';
        if (website === null) return 'no-website';
        // Jika ada konsep "fitur terkunci", bisa taruh di sini => return 'locked'
        return 'idle';
    }, [website]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('app.external_link') ?? 'External Links', href: website?.id ? route('externalLinks.index', { website: website.id }) : '' },
    ];

    // Sinkronkan query ?website= seperti pola FAQ Index
    React.useEffect(() => {
        if (website === undefined) return;

        const u = new URL(window.location.href);

        if (website === null) {
            if (u.searchParams.has('website')) {
                u.searchParams.delete('website');
                router.replace({ url: u.toString(), preserveState: true, preserveScroll: true });
            }
            return;
        }

        // Pastikan ?website=<id> ada di URL
        if (u.searchParams.get('website') !== website.id) {
            router.reload({ data: { website: website.id } });
        }
    }, [website]);

    return (
        <MainLayout
            title={t('app.external_link') ?? 'External Link List'}
            breadcrumbs={breadcrumbs}
            overlayNode={
                pageState === 'no-website' ? (
                    <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                        {t('app.no_accessible_website')}
                    </h2>
                ) : null /* taruh 'locked' di sini kalau perlu */
            }
        >
            <Head title={t('app.external_link') ?? 'External Link List'} />

            {pageState === 'loading' ? <DataTableLoading cols={5} rows={10} searchBar /> : pageState === 'idle' ? <DataExternalLinks /> : null}
        </MainLayout>
    );
}
