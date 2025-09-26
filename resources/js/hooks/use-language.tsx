import { useCallback, useEffect, useState } from 'react';

export type Language = 'id' | 'en';

export const DEFAULT_LANGUAGE = 'en';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (language: Language) => {
    document.documentElement.lang = language;
};

export function initializeLanguange() {
    const savedLanguage = (localStorage.getItem('lang') as Language) || DEFAULT_LANGUAGE;

    applyTheme(savedLanguage);
}

export function useLanguage() {
    const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

    const updateLanguage = useCallback((mode: Language) => {
        setLanguage(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('lang', mode);

        // Store in cookie for SSR...
        setCookie('lang', mode);

        applyTheme(mode);
    }, []);

    useEffect(() => {
        const savedLanguage = localStorage.getItem('lang') as Language | null;
        updateLanguage(savedLanguage || DEFAULT_LANGUAGE);
    }, [updateLanguage]);

    return { language, updateLanguage } as const;
}
