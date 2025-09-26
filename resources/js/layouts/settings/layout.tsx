import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { type PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useLaravelReactI18n();

    const sidebarNavItems: NavItem[] = [
        {
            title: t('app.profile'),
            route: {
                name: 'profile.edit',
            },
            icon: null,
        },
        {
            title: t('app.password'),
            route: {
                name: 'password.edit',
            },
            icon: null,
        },
    ];

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading title={t('app.settings')} description={t('app.settings_description')} />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${route(item.route.name)}-${index}`}
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': route().current(item.route.name),
                                })}
                            >
                                <Link href={route(item.route.name)} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
