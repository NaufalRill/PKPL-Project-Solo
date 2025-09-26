import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronsUpDown, Plus, X } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

// ----- Local types (adjust if you already have these in '@/types') -----
type Client = { id: string; name: string };
type Feature = { id: string; name: string };

type Website = {
    id: string;
    name: string;
    url: string;
    deployed_at?: string | null;
    faq_display_mode?: number;
    external_link_display_mode?: number;
    clients?: Client[]; // preselected clients from backend
    features?: Feature[]; // preselected features from backend
};

type PageProps = {
    website: Website;
    clients: Client[];
    features: Feature[];
};

// ----- Chip helper -----
function ClientChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-sm">
            {label}
            <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
            </button>
        </span>
    );
}

export default function EditWebsite() {
    const { t } = useLaravelReactI18n();
    const { props } = usePage<PageProps>();
    const website = props.website;

    // Options from controller
    const clientOptions: Client[] = useMemo(() => props.clients ?? [], [props.clients]);
    const featureOptions: Feature[] = useMemo(() => props.features ?? [], [props.features]);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('app.websites'), href: route('websites.index') },
            { title: t('app.edit_website'), href: route('websites.edit', { website: website?.id ?? 'id' }) },
        ],
        [t, website?.id],
    );

    // ------- Form state (prefilled from website props) -------
    const { data, setData, put, processing, errors } = useForm({
        name: website?.name ?? '',
        url: website?.url ?? '',
        deployed_at: website?.deployed_at ?? '', // YYYY-MM-DD
        faq_display_mode: website?.faq_display_mode ?? 0,
        external_link_display_mode: website?.external_link_display_mode ?? 0,
        clients: (website?.clients ?? []).map((c) => c.id) as string[],
        features: (website?.features ?? []).map((f) => f.id) as string[],
    });

    // ------- UI state -------
    const [clientSearch, setClientSearch] = useState('');
    const [openCreateClient, setOpenCreateClient] = useState(false);

    const filteredClients = useMemo<Client[]>(() => {
        const q = clientSearch.trim().toLowerCase();
        return q ? clientOptions.filter((c) => c.name.toLowerCase().includes(q)) : clientOptions;
    }, [clientSearch, clientOptions]);

    const toggleClient = (id: string) => {
        setData('clients', data.clients.includes(id) ? data.clients.filter((v) => v !== id) : [...data.clients, id]);
    };

    const toggleFeature = (id: string) => {
        setData('features', data.features.includes(id) ? data.features.filter((v) => v !== id) : [...data.features, id]);
    };

    const submitWebsite: FormEventHandler = (e) => {
        e.preventDefault();
        if (!website?.id) return; // safety
        put(route('websites.update', { website: website.id }));
    };

    // ------- Quick-create client (modal) -------
    const clientForm = useForm({
        name: '',
        contact: '',
        email: '',
        password: '',
    });

    const submitNewClient: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('clients.store'), clientForm.data, {
            preserveScroll: true,
            onSuccess: () => {
                // Refresh daftar clients saja; controller harus mengirim ulang props `clients`
                router.reload({ only: ['clients'] });
                setOpenCreateClient(false);
                clientForm.reset();
            },
        });
    };

    const generatePassword = () => {
        const p = Math.random().toString(36).slice(-10);
        clientForm.setData('password', p);
    };

    // Precompute selected chips
    const selectedClientChips = useMemo<{ id: string; name: string }[]>(
        () =>
            data.clients
                .map((id) => clientOptions.find((c) => c.id === id) ?? null)
                .filter((c): c is Client => c !== null)
                .map((c) => ({ id: c.id, name: c.name })),
        [data.clients, clientOptions],
    );

    return (
        <MainLayout breadcrumbs={breadcrumbs} title={t('app.edit_website')}>
            <Head title={t('app.edit_website')} />

            <form onSubmit={submitWebsite} className="mt-8 space-y-10">
                {/* ===== Section: Basic Information ===== */}
                <section className="space-y-6">
                    <div className="text-lg font-semibold">{t('app.basic_information')}</div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('app.website_name')}*</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('app.website_name_placeholder')}
                                required
                            />

                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="url">{t('app.website_url')}*</Label>
                            <Input
                                id="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                placeholder={t('app.website_url_placeholder')}
                                required
                            />

                            <InputError message={errors.url} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="deployed_at">{t('app.deploy_date') ?? 'Tanggal Deploy'}</Label>
                            <Input
                                id="deployed_at"
                                type="date"
                                value={data.deployed_at as string}
                                onChange={(e) => setData('deployed_at', e.target.value)}
                            />
                            <InputError message={errors.deployed_at} />
                        </div>
                    </div>
                </section>

                {/* ===== Section: Client Information ===== */}
                <section className="space-y-6">
                    <div className="text-lg font-semibold">{t('app.clients_information')}</div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Multi-select with dropdown */}
                        <div className="grid gap-2">
                            <Label>{t('app.clients_link_profile') ?? "Client's Profile Link*"}</Label>

                            {/* Selected chips */}
                            {selectedClientChips.length > 0 && (
                                <div className="mb-1 flex flex-wrap gap-2">
                                    {selectedClientChips.map((c) => (
                                        <ClientChip key={c.id} label={c.name} onRemove={() => toggleClient(c.id)} />
                                    ))}
                                </div>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between md:w-[420px]">
                                        {data.clients.length ? `${data.clients.length} selected` : (t('app.select_client') ?? 'Select client(s)')}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-[320px] p-2">
                                    {/* search input di dalam dropdown */}
                                    <Input
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        placeholder={t('app.search_by_client') ?? 'Search client...'}
                                        className="mb-2"
                                    />

                                    {/* daftar pilihan dengan checkbox */}
                                    {filteredClients.map((c) => (
                                        <DropdownMenuCheckboxItem
                                            key={c.id}
                                            checked={data.clients.includes(c.id)}
                                            onCheckedChange={() => toggleClient(c.id)}
                                            className="cursor-pointer"
                                        >
                                            {c.name}
                                        </DropdownMenuCheckboxItem>
                                    ))}

                                    {filteredClients.length === 0 && (
                                        <div className="px-2 py-3 text-sm text-muted-foreground">{t('app.no_results') ?? 'No clients found'}</div>
                                    )}

                                    {data.clients.length > 0 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start"
                                                onClick={() => setData('clients', [])}
                                            >
                                                {t('app.clear_selection') ?? 'Clear selection'}
                                            </Button>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <InputError message={errors.clients} />
                        </div>

                        {/* Quick create client button */}
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpenCreateClient(true)}
                                className="inline-flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                {t('app.create_client_account')}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ===== Section: Package & Features ===== */}
                <section className="space-y-6">
                    <div className="text-lg font-semibold">{t('app.package_information')}</div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* (Optional) Package Type placeholder, tidak disubmit ke backend sekarang */}
                        <div className="grid gap-2">
                            <Label>{t('app.package_type') ?? 'Package Type*'}</Label>
                            <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">Lite</div>
                        </div>

                        {/* Features checkboxes */}
                        <div className="grid gap-3">
                            <Label>{t('app.select_feature') ?? 'Select Feature*'}</Label>
                            <div className="flex flex-wrap gap-3">
                                {featureOptions.map((f) => (
                                    <label
                                        key={f.id}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 select-none"
                                    >
                                        <Checkbox checked={data.features.includes(f.id)} onCheckedChange={() => toggleFeature(f.id)} />
                                        <span>{f.name}</span>
                                    </label>
                                ))}
                            </div>

                            <InputError message={errors.features} />
                        </div>
                    </div>
                </section>

                {/* ===== Actions ===== */}
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" asChild>
                        <Link href={route('websites.index')}>{t('app.cancel')}</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {t('app.save') ?? 'Save'}
                    </Button>
                </div>
            </form>

            {/* ===== Modal: Create Client ===== */}
            <Dialog open={openCreateClient} onOpenChange={setOpenCreateClient}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>{t('app.add_account') ?? 'Add Account'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitNewClient} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="client-name">{t('app.client_name')}</Label>
                                <Input
                                    id="client-name"
                                    value={clientForm.data.name}
                                    onChange={(e) => clientForm.setData('name', e.target.value)}
                                    required
                                    placeholder={t('app.client_name_placeholder')}
                                />
                                <InputError message={clientForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="client-email">{t('app.client_email')}</Label>
                                <Input
                                    id="client-email"
                                    type="email"
                                    value={clientForm.data.email}
                                    onChange={(e) => clientForm.setData('email', e.target.value)}
                                    required
                                    placeholder={t('app.client_email_placeholder')}
                                />
                                <InputError message={clientForm.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="client-contact">{t('app.client_contact')}</Label>
                                <Input
                                    id="client-contact"
                                    value={clientForm.data.contact}
                                    onChange={(e) => clientForm.setData('contact', e.target.value)}
                                    required
                                    placeholder={t('app.client_contact_placeholder')}
                                />
                                <InputError message={clientForm.errors.contact} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="client-password">{t('app.client_password')}</Label>
                                <Input
                                    id="client-password"
                                    value={clientForm.data.password}
                                    onChange={(e) => clientForm.setData('password', e.target.value)}
                                    required
                                    placeholder={t('app.client_password_placeholder')}
                                />
                                <div>
                                    <Button type="button" variant="secondary" onClick={generatePassword} className="mt-2">
                                        {t('app.generate_password')}
                                    </Button>
                                </div>
                                <InputError message={clientForm.errors.password} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreateClient(false)}>
                                {t('app.cancel')}
                            </Button>
                            <Button type="submit" disabled={clientForm.processing}>
                                {t('app.create_client_account')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
