import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { LaravelReactI18nProvider } from 'laravel-react-i18n';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { DEFAULT_LANGUAGE, initializeLanguange } from './hooks/use-language';
import AppLayout from './layouts/app-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`] as {
            default: {
                layout: ReactNode | ((page: ReactNode) => ReactNode);
            };
        };
        page.default.layout = name.startsWith('auth/') ? undefined : (page: ReactNode) => <AppLayout>{page}</AppLayout>;
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const htmlEl = document.documentElement;

        root.render(
            <LaravelReactI18nProvider
                locale={htmlEl?.lang || DEFAULT_LANGUAGE}
                fallbackLocale={DEFAULT_LANGUAGE}
                files={import.meta.glob('/lang/*.json')}
            >
                <App {...props} />
            </LaravelReactI18nProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
initializeLanguange();
