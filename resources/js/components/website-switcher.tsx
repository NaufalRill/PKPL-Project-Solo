'use client';

import { AlertCircle, Check, ChevronsUpDown, Globe, Plus } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { cn, delay } from '@/lib/utils';
import { Website } from '@/types';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Badge } from './ui/badge';

type WebsiteContext = { websites?: Website[]; website?: Website | null; updateWebsite?: (website: Website | null) => void };

const WebsiteContext = createContext<WebsiteContext | null>(null);

export function useWebsiteContext() {
    const context = useContext(WebsiteContext);
    if (!context) {
        throw new Error('useWebsiteContext must be used within a WebsiteContextProvider.');
    }

    return context;
}

export function WebsiteContextProvider({ children }: { children: ReactNode }) {
    const setCookie = (name: string, value: string, days = 365) => {
        if (typeof document === 'undefined') {
            return;
        }

        const maxAge = days * 24 * 60 * 60;
        document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
    };

    const clearCookie = (name: string) => {
        if (typeof document === 'undefined') {
            return;
        }

        document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
    };

    const [websites, setWebsites] = useState<Website[]>();
    const [website, setWebsite] = useState<Website | null>();

    const fetchWebsites = async () => {
        await delay();
        const response = await fetch(route('websites.list'));
        const jsonResponse = await response.json();
        setWebsites(jsonResponse.data);
    };

    const updateWebsite = useCallback((website: Website | null) => {
        if (website === null) {
            setWebsite(null);
            localStorage.removeItem('website');
            clearCookie('website');
            return;
        }

        setWebsite({ ...website });

        // Store in localStorage for client-side persistence...
        localStorage.setItem('website', website.id);

        // Store in cookie for SSR...
        setCookie('website', website.id);
    }, []);

    useEffect(() => {
        fetchWebsites();
    }, []);

    useEffect(() => {
        if (websites === undefined) {
            return;
        }

        if (websites.length === 0) {
            updateWebsite(null);
            return;
        }

        const savedWebsite = localStorage.getItem('website') as string | null;
        if (savedWebsite) {
            const index = websites.findIndex(({ id }) => id === savedWebsite);
            if (index > 0) {
                updateWebsite(websites[index]);
                return;
            }
        }

        updateWebsite(websites[0]);
    }, [updateWebsite, websites]);

    const contextValue = useMemo<WebsiteContext>(() => ({ website, updateWebsite, websites }), [website, updateWebsite, websites]);

    return <WebsiteContext.Provider value={contextValue}>{children}</WebsiteContext.Provider>;
}

export function WebsiteSwitcher({ hideAddWebsite = true }: { hideAddWebsite?: boolean }) {
    const { isMobile } = useSidebar();
    const { website: activeWebsite, updateWebsite, websites } = useWebsiteContext();
    const { t } = useLaravelReactI18n();
    const { state: sidebarState } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" tooltip={{ children: 'Change website' }} asChild>
                            <button
                                className="peer/menu-button flex h-8 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"
                                disabled={websites === undefined}
                            >
                                <Globe />
                                {sidebarState === 'expanded' &&
                                    (websites === undefined ? (
                                        <div>{t('app.loading')}...</div>
                                    ) : !activeWebsite ? (
                                        <>
                                            <AlertCircle />
                                            <p>{t('app.no_accessible_website')}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-medium">{activeWebsite.name}</span>
                                                <span className="truncate text-xs">{activeWebsite.url}</span>
                                            </div>
                                            <ChevronsUpDown className="ml-auto" />
                                        </>
                                    ))}
                            </button>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
                        align="start"
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">{t('app.websites')}</DropdownMenuLabel>
                        {websites === undefined ? (
                            <div>Loading...</div>
                        ) : websites.length === 0 ? (
                            <DropdownMenuItem>
                                <span className="text-xs text-muted-foreground">{t('app.no_accessible_website')}</span>
                            </DropdownMenuItem>
                        ) : (
                            websites.map((website) => (
                                <DropdownMenuItem
                                    key={website.id}
                                    onClick={() => updateWebsite?.(website)}
                                    className={cn(
                                        'cursor-pointer gap-2 p-2 hover:bg-black/5 dark:hover:bg-white/10',
                                        activeWebsite?.id === website.id ? 'bg-black/5 dark:bg-white/10' : '',
                                    )}
                                >
                                    <Check className={activeWebsite?.id !== website.id ? 'invisible' : ''} />

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{website.name}</span>
                                        <span className="truncate text-xs">{website.url}</span>
                                    </div>

                                    <DropdownMenuShortcut>
                                        {website.status === 'active' ? (
                                            <Badge>{t('app.active')}</Badge>
                                        ) : (
                                            <Badge variant="secondary">{t('app.inactive')}</Badge>
                                        )}
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            ))
                        )}
                        {!hideAddWebsite && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="p-0">
                                    <Link className="flex flex-1 items-center gap-2 p-2" href={route('websites.create')}>
                                        <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                            <Plus className="size-4" />
                                        </div>
                                        <div className="font-medium text-muted-foreground">{t('app.add_website')}</div>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
