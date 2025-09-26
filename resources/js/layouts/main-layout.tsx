import { AppContent } from '@/components/app-content';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    title?: string;
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    rightNode?: ReactNode;
    overlayNode?: ReactNode;
    size?: 'md' | 'lg' | 'xl' | 'full';
    alignment?: 'start' | 'center' | 'end';
}

const variants = {
    start: {
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        full: '',
    },
    center: {
        md: 'max-w-screen-md mx-auto lg:px-0',
        lg: 'max-w-screen-lg mx-auto xl:px-0',
        xl: 'max-w-screen-xl mx-auto 2xl:px-0',
        full: '',
    },
    end: {
        md: 'max-w-screen-md ms-auto',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl ms-auto',
        full: '',
    },
};

export default ({ title, children, rightNode, overlayNode, breadcrumbs, size = 'xl', alignment = 'center' }: AppLayoutProps) => (
    <AppContent variant="sidebar" className="overflow-x-hidden">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        <div className={cn('-mt-16 min-h-screen pt-16', overlayNode ? 'relative' : '')}>
            <div className={cn('w-full p-4', variants[alignment][size])}>
                {title && (
                    <div className="mb-4 flex flex-col gap-4 rounded-xl">
                        <div className={cn('flex items-center gap-4', rightNode ? 'justify-between' : '')}>
                            <h1 className="text-5xl font-bold">{title}</h1>

                            {rightNode !== undefined && <div className="flex gap-4">{rightNode}</div>}
                        </div>
                    </div>
                )}

                {children}
            </div>

            {overlayNode && <div className="absolute inset-0 top-16 flex-1 bg-black/10 backdrop-blur-xs dark:bg-black/20">{overlayNode}</div>}
        </div>
    </AppContent>
);
