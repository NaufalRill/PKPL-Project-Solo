import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type Mode = 'admin' | 'cms';

type ModeContext = { mode?: Mode; updateMode?: (mode: Mode) => void };

const ModeContext = createContext<ModeContext | null>(null);

export function useModeContext() {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error('useModeContext must be used within a ModeContextProvider.');
    }

    return context;
}

const routes = {
    admin: ['dashboard', 'websites.*', 'clients.*'],
    cms: ['articles.*', 'forms.*', 'formSubmissions.*', 'faqs.*', 'externalLinks.*'],
};

const DEFAULT_ADMIN_ROUTE = 'dashboard';
const DEFAULT_CMS_ROUTE = 'articles.index';

export function ModeContextProvider({ children }: { children: ReactNode }) {
    const DEFAULT_MODE = 'admin';

    const setCookie = (name: string, value: string, days = 365) => {
        if (typeof document === 'undefined') {
            return;
        }

        const maxAge = days * 24 * 60 * 60;
        document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
    };

    const { auth } = usePage<SharedData>().props;
    const [mode, setMode] = useState<Mode>();

    let updateMode: ((mode: Mode) => void) | undefined = useCallback((mode: Mode) => {
        setMode(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('mode', mode);

        // Store in cookie for SSR...
        setCookie('mode', mode);
    }, []);

    if (auth.user.role === 'client') {
        updateMode = undefined;
    }

    const isCurrentRouteAdmin = () => routes.admin.some((routeName) => route().current(routeName));
    const isCurrentRouteCms = () => routes.cms.some((routeName) => route().current(routeName));
    const isCurrentRouteHome = () => route().current('home');

    const onRouterFinish = useRef<(() => void) | undefined>(undefined);

    useEffect(() => {
        if (updateMode === undefined) {
            return onRouterFinish.current;
        }

        onRouterFinish.current = router.on('finish', () => {
            if (updateMode === undefined) {
                return;
            }

            if (isCurrentRouteAdmin()) {
                updateMode('admin');
                return;
            }

            if (isCurrentRouteCms()) {
                updateMode('cms');
                return;
            }
        });

        if (isCurrentRouteAdmin()) {
            updateMode('admin');
            return onRouterFinish.current;
        }

        if (isCurrentRouteCms()) {
            updateMode('cms');
            return onRouterFinish.current;
        }

        const savedMode = localStorage.getItem('mode') as Mode | null;
        updateMode(savedMode || DEFAULT_MODE);
        return onRouterFinish.current;
    }, [updateMode]);

    useEffect(() => {
        if (mode === undefined) {
            return;
        }

        if (mode === 'admin' && (isCurrentRouteCms() || isCurrentRouteHome())) {
            router.visit(route(DEFAULT_ADMIN_ROUTE));
            return;
        }

        if (mode === 'cms' && (isCurrentRouteAdmin() || isCurrentRouteHome())) {
            router.visit(route(DEFAULT_CMS_ROUTE));
            return;
        }
    }, [mode]);

    const contextValue = useMemo<ModeContext>(() => ({ mode, updateMode }), [mode, updateMode]);

    return <ModeContext.Provider value={contextValue}>{children}</ModeContext.Provider>;
}

export default function () {
    const { mode, updateMode } = useModeContext();
    const { t } = useLaravelReactI18n();

    return (
        <div className="flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:bg-black/5 dark:hover:bg-white/10">
            <Switch
                id="switch-mode"
                className="cursor-pointer"
                checked={mode === 'cms'}
                onCheckedChange={() => {
                    if (mode === 'admin') {
                        updateMode?.('cms');
                        return;
                    }

                    updateMode?.('admin');
                }}
            />
            <Label htmlFor="switch-mode" className="flex-1 cursor-pointer">
                {t('app.mode')}: {mode === 'admin' ? t('app.admin') : t('app.cms')}
            </Label>
        </div>
    );
}
