import { ClipboardList, Globe, LayoutGrid, LinkIcon, List, Rss, Users } from 'lucide-react';

const cmsNavItems = [
    {
        title: 'app.blog',
        route: {
            name: 'articles.index',
        },
        icon: Rss,
    },
    {
        title: 'app.form',
        route: {
            name: 'forms.index',
        },
        icon: ClipboardList,
    },
    {
        title: 'app.faq',
        route: {
            name: 'faqs.index',
        },
        icon: List,
    },
    {
        title: 'app.external_link',
        route: {
            name: 'externalLinks.index',
        },
        icon: LinkIcon,
    },
];

export default {
    admin: {
        admin: [
            {
                title: 'app.dashboard',
                route: {
                    name: 'dashboard',
                },
                icon: LayoutGrid,
            },
            {
                title: 'app.websites',
                route: {
                    name: 'websites.index',
                },
                icon: Globe,
            },
            {
                title: 'app.clients',
                route: {
                    name: 'clients.index',
                },
                icon: Users,
            },
        ],
        cms: cmsNavItems,
    },
    client: cmsNavItems,
};
