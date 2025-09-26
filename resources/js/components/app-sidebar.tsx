import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { WebsiteSwitcher } from '@/components/website-switcher';
import navItems from '@/const/nav-items';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import AppLogo from './app-logo';
import { useModeContext } from './mode-switcher';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { mode } = useModeContext();

    const { t } = useLaravelReactI18n();

    const mainNavItems: { admin: { admin: NavItem[]; cms: NavItem[] }; client: NavItem[] } = {
        admin: {
            admin: navItems.admin.admin.map((navItem: NavItem) => ({ ...navItem, title: t(navItem.title) })),
            cms: navItems.admin.cms.map((navItem: NavItem) => ({ ...navItem, title: t(navItem.title) })),
        },
        client: navItems.client.map((navItem: NavItem) => ({ ...navItem, title: t(navItem.title) })),
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {((auth.user.role === 'admin' && mode === 'cms') || auth.user.role === 'client') && (
                    <WebsiteSwitcher hideAddWebsite={auth.user.role === 'client'} />
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={auth.user.role === 'admin' ? mainNavItems.admin[mode || 'admin'] : mainNavItems[auth.user.role]} />
            </SidebarContent>

            <SidebarFooter>
                {/* ModeSwitcher dihapus sesuai permintaan */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
