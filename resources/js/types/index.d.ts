import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    route: {
        name: string;
        params?: unknown;
    };
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    email_verified_at: string | null;
    role: 'admin' | 'client';
    [key: string]: unknown; // This allows for additional properties...
}

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        headClass?: string;
        cellClass?: string;
    }
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export type WebsiteFeature = 'blog' | 'form' | 'faq' | 'external-link';

export interface Website {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive';
    faqDisplayMode: 'single' | 'group';
    externalLinkDisplayMode: 'single' | 'group';
    features: WebsiteFeature[];
    clients?: {
        id: string;
        name: string;
    }[];
    deployedAt?: string;
    orderNumber?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Client {
    id: string;
    contact: string;
    user_id: number;
    user?: User;
    websites?: {
        id: string;
        name: string;
        url: string;
        status: 'active' | 'inactive';
    }[];
    createdAt?: string;
    updatedAt?: string;
}
