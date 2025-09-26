import { useWebsiteContext } from '@/components/website-switcher';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Link as LinkIcon, MoreVertical, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';

// ================== Types ==================
type ExternalLink = {
    id: string;
    label: string;
    url: string;
    index?: number;
    group_index?: number;
};

type ExternalLinkGroup = {
    id: string;
    name: string;
    items: ExternalLink[];
    index?: number;
};

type DisplayMode = 0 | 1;
type ViewMode = 'single' | 'group';

type PageProps = {
    externals?: {
        singles: ExternalLink[];
        groups: ExternalLinkGroup[];
    };
};

interface WebsiteWithDisplayMode {
    id: string;
    external_link_display_mode: DisplayMode;
}

// ================== Utils ==================
function moveItem<T>(arr: T[], from: number, to: number): T[] {
    if (to < 0 || to >= arr.length || from === to) return arr;
    const copy = [...arr];
    const [it] = copy.splice(from, 1);
    copy.splice(to, 0, it);
    return copy;
}

function ReorderArrows({ onUp, onDown, canUp, canDown }: { onUp: () => void; onDown: () => void; canUp: boolean; canDown: boolean }) {
    return (
        <div className="-ml-1 flex w-4 shrink-0 flex-col items-center justify-center leading-none">
            <button
                type="button"
                onClick={onUp}
                disabled={!canUp}
                className="p-0 leading-none text-foreground/80 hover:text-foreground disabled:opacity-30"
                aria-label="Naikkan"
            >
                <ChevronUp className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={onDown}
                disabled={!canDown}
                className="p-0 leading-none text-foreground/80 hover:text-foreground disabled:opacity-30"
                aria-label="Turunkan"
            >
                <ChevronDown className="h-4 w-4" />
            </button>
        </div>
    );
}

function GroupActionsMenu({ onEdit, onRequestDelete }: { onEdit: () => void; onRequestDelete: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <button onClick={onEdit} className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent">
                    Edit Nama Grup
                </button>
                <DropdownMenuSeparator />
                <button className="w-full px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => setTimeout(onRequestDelete, 0)}>
                    Hapus Grup
                </button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const IconLinkRound = () => (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
        <LinkIcon className="h-5 w-5 text-slate-500" />
    </div>
);

// ================== Komponen Utama ==================
export default function DataExternalLinks(): React.ReactElement {
    const { t } = useLaravelReactI18n();
    const { website } = useWebsiteContext() as { website?: WebsiteWithDisplayMode | null };
    const { props } = usePage<PageProps>();

    const page = usePage<{ website?: WebsiteWithDisplayMode }>();
    const websiteFromProps = page.props.website;

    const websiteId = website?.id ?? websiteFromProps?.id;
    const displayModeFromProps = website?.external_link_display_mode ?? websiteFromProps?.external_link_display_mode;

    // ViewMode
    const getInitialViewMode = (): ViewMode => {
        const dm = displayModeFromProps;
        if (dm === 1) return 'group';
        if (dm === 0) return 'single';

        const qs = new URLSearchParams(window.location.search).get('external_link_display_mode');
        if (qs === '1') return 'group';
        if (qs === '0') return 'single';

        const ls = localStorage.getItem('external_link_display_mode');
        return ls === '1' ? 'group' : 'single';
    };
    const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

    // State Data
    const [loading, setLoading] = useState(false);
    const [singleItems, setSingleItems] = useState<ExternalLink[]>([]);
    const [groups, setGroups] = useState<ExternalLinkGroup[]>([]);

    const hasLinks = singleItems.length > 0 || groups.length > 0;
    const [stage, setStage] = useState<'list' | 'create'>(hasLinks ? 'create' : 'list');

    // Dialog & Form
    const [dialogOpen, setDialogOpen] = useState(false);
    const [choice, setChoice] = useState<ViewMode>('single');
    const [groupName] = useState('');
    const [creating, setCreating] = useState(false);

    // Debounce untuk autosave
    const debounceRef = useRef<number | null>(null);
    const debounce = useCallback((fn: () => void, ms = 800) => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(fn, ms);
    }, []);

    // Refs untuk fokus input label
    const singleRefs = useRef<Map<string, HTMLInputElement>>(new Map());
    const setSingleRef = useCallback(
        (id: string) => (el: HTMLInputElement | null) => {
            if (el) singleRefs.current.set(id, el);
            else singleRefs.current.delete(id);
        },
        [],
    );

    const [hydrated, setHydrated] = useState(false);

    // Sinkron viewMode dari DB saat website berubah
    useEffect(() => {
        if (website?.external_link_display_mode === 1) setViewMode('group');
        if (website?.external_link_display_mode === 0) setViewMode('single');
    }, [website?.external_link_display_mode]);

    // FIXED: Persist toggle ViewMode - hilangkan router.visit yang menyebabkan loop
    const persistViewMode = useCallback(
        (mode: ViewMode) => {
            if (!websiteId) return;
            setViewMode(mode);
            localStorage.setItem('external_link_display_mode', mode === 'group' ? '1' : '0');

            router.put(
                route('externalLinks.updateDisplayMode', { website: websiteId }),
                { mode: (mode === 'group' ? 1 : 0) as DisplayMode },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    onError: () => setViewMode((prev) => (prev === 'group' ? 'single' : 'group')),
                },
            );
        },
        [websiteId],
    );

    // Ambil data awal
    const loadData = useCallback(async () => {
        if (!websiteId) return;

        setLoading(true);
        try {
            let singles: ExternalLink[] = [];
            let grps: ExternalLinkGroup[] = [];

            const hasPropsData =
                !!props.externals &&
                ((Array.isArray(props.externals.singles) && props.externals.singles.length > 0) ||
                    (Array.isArray(props.externals.groups) && props.externals.groups.length > 0));

            if (hasPropsData) {
                singles = props.externals!.singles ?? [];
                grps = props.externals!.groups ?? [];
            } else {
                const [singleJson, groupJson] = await Promise.all([
                    fetch(route('externalLinks.list', { website: websiteId }), { headers: { Accept: 'application/json' } }).then((r) => r.json()),
                    fetch(route('externalLinkGroups.list', { website: websiteId }), { headers: { Accept: 'application/json' } }).then((r) =>
                        r.json(),
                    ),
                ]);

                singles = Array.isArray(singleJson?.data) ? singleJson.data : [];
                grps = Array.isArray(groupJson?.data) ? groupJson.data : [];
            }

            setSingleItems(singles);
            setGroups(grps);
            setStage(singles.length > 0 || grps.length > 0 ? 'create' : 'list');
            setHydrated(true);
        } catch (err) {
            console.error('loadData error:', err);
            setSingleItems([]);
            setGroups([]);
            setStage('list');
        } finally {
            setLoading(false);
        }
    }, [websiteId, props.externals]);

    useEffect(() => {
        if (websiteId) loadData();
    }, [websiteId, loadData]);

    // ================== Handlers: SINGLE mode ==================
    const handleSingleAdd = () => {
        const id = crypto.randomUUID();
        const item: ExternalLink = { id, label: '', url: '' };
        setSingleItems((p) => [...p, item]);
        requestAnimationFrame(() => singleRefs.current.get(id)?.focus());
    };

    const handleSingleChangeLabel = (id: string, v: string) => setSingleItems((p) => p.map((it) => (it.id === id ? { ...it, label: v } : it)));
    const handleSingleChangeUrl = (id: string, v: string) => setSingleItems((p) => p.map((it) => (it.id === id ? { ...it, url: v } : it)));
    const handleSingleDelete = (id: string) => setSingleItems((p) => p.filter((it) => it.id !== id));
    const moveSingleAt = (fromIdx: number, direction: 'up' | 'down') => {
        setSingleItems((p) => moveItem(p, fromIdx, fromIdx + (direction === 'up' ? -1 : 1)));
    };

    // ================== Handlers: GROUP mode ==================
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [confirmGroupId, setConfirmGroupId] = useState<string | null>(null);
    const openConfirmDelete = (groupId: string) => setConfirmGroupId(groupId);
    const closeConfirmDelete = () => setConfirmGroupId(null);
    const addNewBtnRef = useRef<HTMLButtonElement | null>(null);

    const addGroup = () => setGroups((gs) => [...gs, { id: crypto.randomUUID(), name: `Group ${gs.length + 1}`, items: [] }]);

    const moveGroupAt = (fromIdx: number, direction: 'up' | 'down') => {
        setGroups((gs) => moveItem(gs, fromIdx, fromIdx + (direction === 'up' ? -1 : 1)));
    };

    const addItemToGroup = (groupId: string) => {
        const tempId = crypto.randomUUID();
        setGroups((gs) =>
            gs.map((g) => (g.id === groupId ? { ...g, items: [...(g.items || []), { id: tempId, label: 'Label', url: 'https://...' }] } : g)),
        );
    };

    const changeGroupTitle = (groupId: string, name: string) => setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, name } : g)));
    const deleteGroup = (groupId: string) => {
        setEditingGroupId((id) => (id === groupId ? null : id));
        setGroups((gs) => gs.filter((g) => g.id !== groupId));
    };

    const changeItemLabel = (groupId: string, itemId: string, label: string) =>
        setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, label } : it)) } : g)));

    const changeItemUrl = (groupId: string, itemId: string, url: string) =>
        setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, url } : it)) } : g)));

    const deleteItem = (groupId: string, itemId: string) =>
        setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g)));

    const moveItemInGroup = (groupId: string, fromIdx: number, direction: 'up' | 'down') =>
        setGroups((gs) =>
            gs.map((g) => (g.id === groupId ? { ...g, items: moveItem(g.items, fromIdx, fromIdx + (direction === 'up' ? -1 : 1)) } : g)),
        );

    // ================== FIXED: Autosave ==================
    // Track apakah sedang dalam proses saving untuk mencegah loop
    const [isSaving] = useState(false);

    // SINGLE autosave - FIXED
    useEffect(() => {
        if (!websiteId || viewMode !== 'single' || !hydrated || creating) return;
        if (singleItems.length === 0) return;

        debounce(() => {
            const payload = singleItems.map((it, idx) => ({ label: it.label, url: it.url, index: idx }));

            router.post(
                route('externalLinks.store', { website: websiteId }),
                { mode: 'single', items: payload },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: [],
                },
            );
        });
    }, [singleItems, viewMode, websiteId, hydrated, creating, debounce]);
    // GROUP autosave - FIXED
    useEffect(() => {
        if (!websiteId || viewMode !== 'group' || !hydrated || creating) return;
        if (groups.length === 0) return;

        debounce(() => {
            const payload = groups.map((g, gidx) => ({
                name: g.name,
                index: gidx,
                items: (g.items || []).map((it, iidx) => ({ label: it.label, url: it.url, group_index: iidx })),
            }));

            router.post(
                route('externalLinks.store', { website: websiteId }),
                { mode: 'group', groups: payload },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: [],
                },
            );
        });
    }, [groups, viewMode, websiteId, hydrated, creating, debounce]);

    // ================== Create pertama kali ==================
    const handleCreate = useCallback(
        (mode: ViewMode, name?: string) => {
            if (!website) return;
            setCreating(true);
            setDialogOpen(false);

            const opts = {
                preserveScroll: true,
                replace: true, // PENTING: gunakan replace
                onFinish: () => setCreating(false),
                onSuccess: () => setStage('create'),
                onError: () => setStage('create'),
            } as const;

            if (mode === 'group') {
                router.post(route('externalLinkGroups.store', { website: website.id }), { name: name || undefined }, opts);
                return;
            }

            router.post(route('externalLinks.store', { website: website.id }), { mode }, opts);
        },
        [website],
    );

    // ================== Render ==================
    return (
        <div className="mt-4">
            {/* Toolbar */}
            {stage === 'create' && (
                <div className="mb-4 flex items-center justify-end gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                {t('app.view') ?? 'View'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>{t('app.toggle_columns') ?? 'Toggle columns'}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={viewMode === 'group'}
                                onCheckedChange={(checked) => {
                                    if (checked) persistViewMode('group');
                                }}
                            >
                                {t('app.group_link') ?? 'Group Link'}
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={viewMode === 'single'}
                                onCheckedChange={(checked) => {
                                    if (checked) persistViewMode('single');
                                }}
                            >
                                {t('app.singular_link') ?? 'Singular Link'}
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        ref={addNewBtnRef}
                        className="gap-2"
                        onClick={() => {
                            if (viewMode === 'group') addGroup();
                            else handleSingleAdd();
                        }}
                        disabled={isSaving} // Disable saat saving
                    >
                        <Plus className="h-4 w-4" />
                        {viewMode === 'group' ? (t('app.add_group_link') ?? 'Tambah Grup Baru') : (t('app.add_external_link') ?? 'Tambah Link Baru')}
                    </Button>
                </div>
            )}

            {/* Loading & Empty State */}
            {loading ? (
                <div className="mt-12 text-center text-sm text-muted-foreground">{t('app.loading') || 'Loading...'}</div>
            ) : !hasLinks && stage === 'list' ? (
                <div className="grid min-h-[60vh] place-items-center">
                    <div className="space-y-4 text-center">
                        <p className="max-w-md text-sm text-muted-foreground">
                            {t('app.no_external_links_desc') ?? 'Mulai dengan memilih mode pembuatan: singular atau group.'}
                        </p>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="size-4" /> {t('app.add_external_link') || 'Add External Links'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
                                <div className="p-5">
                                    <h3 className="text-center text-xl font-semibold">
                                        {t('app.how_to_manage_external_link') || 'Bagaimana kamu ingin mengatur external link?'}
                                    </h3>
                                    <Separator className="my-3" />
                                    <div className="space-y-4 text-left">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="radio"
                                                name="ext-mode"
                                                value="single"
                                                checked={choice === 'single'}
                                                onChange={() => setChoice('single')}
                                            />
                                            <span className="text-sm">
                                                {t('app.choice_single') || 'Saya ingin menambahkan link satu per satu (Mandiri)'}
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="radio"
                                                name="ext-mode"
                                                value="group"
                                                checked={choice === 'group'}
                                                onChange={() => setChoice('group')}
                                            />
                                            <div className="w-full">
                                                <span className="text-sm">
                                                    {t('app.choice_group') || 'Saya ingin mengelompokkan link (Dalam Grup)'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="mt-6 flex justify-start">
                                        <Button onClick={() => handleCreate(choice, groupName.trim() || undefined)} disabled={creating}>
                                            {creating ? 'Menyimpan…' : (t('app.use_this_mode') ?? 'Gunakan Mode Ini')}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            ) : viewMode === 'single' ? (
                // ================== SINGLE MODE UI ==================
                <div className="w-full max-w-xl space-y-4">
                    {singleItems.map((it, idx) => (
                        <Card key={it.id} className="space-y-2">
                            <CardContent className="p-4">
                                <div className="flex h-10 items-center">
                                    <ReorderArrows
                                        onUp={() => moveSingleAt(idx, 'up')}
                                        onDown={() => moveSingleAt(idx, 'down')}
                                        canUp={idx > 0}
                                        canDown={idx < singleItems.length - 1}
                                    />
                                    <div className="mx-3">
                                        <IconLinkRound />
                                    </div>
                                    <div className="flex flex-1 items-center gap-2">
                                        <Label htmlFor={`label-${it.id}`} className="sr-only">
                                            Label {idx + 1}
                                        </Label>
                                        <Input
                                            id={`label-${it.id}`}
                                            ref={setSingleRef(it.id)}
                                            value={it.label}
                                            onChange={(e) => handleSingleChangeLabel(it.id, e.target.value)}
                                            placeholder={t('app.link_label') ?? 'Link Label'}
                                            className="h-10 flex-1 border-0 bg-transparent p-0 shadow-none outline-none focus:border-0 focus-visible:ring-0"
                                            required
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            type="button"
                                            onClick={() => {
                                                const el = singleRefs.current.get(it.id);
                                                el?.focus();
                                                el?.setSelectionRange?.(0, (el?.value || '').length);
                                            }}
                                            aria-label={`Edit label ${idx + 1}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-start gap-2 pl-[78px]">
                                    <Label htmlFor={`url-${it.id}`} className="sr-only">
                                        URL {idx + 1}
                                    </Label>
                                    <Input
                                        id={`url-${it.id}`}
                                        type="url"
                                        value={it.url}
                                        onChange={(e) => handleSingleChangeUrl(it.id, e.target.value)}
                                        placeholder="https://…"
                                        className="h-9 w-full flex-1"
                                        required
                                    />
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                type="button"
                                                aria-label={`Hapus link ${idx + 1}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Hapus link ini?</DialogTitle>
                                                <DialogDescription>Label & URL akan dihapus.</DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="secondary">Batal</Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        className="bg-red-600 text-white hover:bg-red-700"
                                                        onClick={() => handleSingleDelete(it.id)}
                                                    >
                                                        Hapus
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <button
                        type="button"
                        onClick={handleSingleAdd}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                    >
                        <Plus className="h-4 w-4" />
                        {t('app.add_external_link') || 'Tambah Link Baru'}
                    </button>
                </div>
            ) : (
                // ================== GROUP MODE UI ==================
                <div className="mt-2 flex w-full max-w-3xl flex-col gap-6">
                    {groups.map((g, idx) => (
                        <Card key={g.id} className="w-full">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <ReorderArrows
                                            onUp={() => moveGroupAt(idx, 'up')}
                                            onDown={() => moveGroupAt(idx, 'down')}
                                            canUp={idx > 0}
                                            canDown={idx < groups.length - 1}
                                        />
                                        {editingGroupId !== g.id ? (
                                            <CardTitle className="text-lg font-semibold">{g.name}</CardTitle>
                                        ) : (
                                            <div className="w-full max-w-xs">
                                                <Input
                                                    value={g.name}
                                                    onChange={(e) => changeGroupTitle(g.id, e.target.value)}
                                                    onBlur={() => setEditingGroupId(null)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === 'Escape') setEditingGroupId(null);
                                                    }}
                                                    autoFocus
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <GroupActionsMenu onEdit={() => setEditingGroupId(g.id)} onRequestDelete={() => openConfirmDelete(g.id)} />
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {g.items.map((it, iidx) => (
                                    <div key={it.id} className="space-y-2">
                                        <div className="flex h-10 items-center">
                                            <ReorderArrows
                                                onUp={() => moveItemInGroup(g.id, iidx, 'up')}
                                                onDown={() => moveItemInGroup(g.id, iidx, 'down')}
                                                canUp={iidx > 0}
                                                canDown={iidx < g.items.length - 1}
                                            />
                                            <div className="ml-2 flex flex-1 items-center gap-2">
                                                <span className="text-sm text-muted-foreground select-none">{iidx + 1}.</span>
                                                <Label htmlFor={`label-${g.id}-${it.id}`} className="sr-only">
                                                    Label {iidx + 1}
                                                </Label>
                                                <Input
                                                    id={`label-${g.id}-${it.id}`}
                                                    value={it.label}
                                                    onChange={(e) => changeItemLabel(g.id, it.id, e.target.value)}
                                                    placeholder={t('app.link_label') ?? 'Link Label'}
                                                    className="h-10 flex-1 border-0 bg-transparent p-0 shadow-none outline-none focus:border-0 focus-visible:ring-0"
                                                    required
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-foreground"
                                                    onClick={(e) => {
                                                        const input = (e.currentTarget.parentElement as HTMLElement)?.querySelector(
                                                            'input',
                                                        ) as HTMLInputElement | null;
                                                        input?.focus();
                                                        input?.setSelectionRange?.(0, 999);
                                                    }}
                                                    aria-label={`Edit label ${iidx + 1}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Label htmlFor={`url-${g.id}-${it.id}`} className="sr-only">
                                                URL {iidx + 1}
                                            </Label>
                                            <Input
                                                id={`url-${g.id}-${it.id}`}
                                                type="url"
                                                placeholder="https://…"
                                                value={it.url}
                                                onChange={(e) => changeItemUrl(g.id, it.id, e.target.value)}
                                                className="h-9 w-full flex-1"
                                                required
                                            />
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                                        aria-label={`Hapus link ${iidx + 1}`}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Hapus link ini?</DialogTitle>
                                                        <DialogDescription>Label & URL akan dihapus dari grup.</DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="secondary">Batal</Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button
                                                                className="bg-red-600 text-white hover:bg-red-700"
                                                                onClick={() => deleteItem(g.id, it.id)}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addItemToGroup(g.id)}
                                    className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('app.add_external_link') || 'Tambah Link Baru'}
                                </button>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="mt-2">
                        <Button type="button" variant="outline" className="gap-2" onClick={addGroup} ref={addNewBtnRef}>
                            <Plus className="h-4 w-4" />
                            {t('app.add_group_link') || 'Tambah Grup Baru'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Konfirmasi hapus grup */}
            <Dialog
                open={confirmGroupId !== null}
                onOpenChange={(o) => {
                    if (!o) closeConfirmDelete();
                }}
            >
                <DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Hapus Grup?</DialogTitle>
                        <DialogDescription>Seluruh link di dalam grup juga akan dihapus.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={closeConfirmDelete}>
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                const id = confirmGroupId!;
                                closeConfirmDelete();
                                setTimeout(() => {
                                    deleteGroup(id);
                                    requestAnimationFrame(() => addNewBtnRef.current?.focus());
                                }, 0);
                            }}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
