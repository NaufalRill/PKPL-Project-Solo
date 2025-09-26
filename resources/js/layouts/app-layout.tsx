import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { ModeContextProvider } from '@/components/mode-switcher';
import { WebsiteContextProvider } from '@/components/website-switcher';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default ({ children }: AppLayoutProps) => {
    return (
        <ModeContextProvider>
            <WebsiteContextProvider>
                <AppShell variant="sidebar">
                    <AppSidebar />
                    {children}
                </AppShell>
            </WebsiteContextProvider>
        </ModeContextProvider>
    );
};
