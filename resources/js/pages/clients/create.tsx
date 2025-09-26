import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainLayout from '@/layouts/main-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

import { FormEventHandler } from 'react';

export default function CreateClientForm() {
    const { t } = useLaravelReactI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('app.clients'),
            href: route('clients.index'),
        },
        {
            title: t('app.create_client'),
            href: route('clients.create'),
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        contact: '',
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clients.store'));
    };

    const generatePassword = () => {
        const newPassword = Math.random().toString(36).slice(-8);
        setData('password', newPassword);
    };

    return (
        <MainLayout breadcrumbs={breadcrumbs} title={t('app.create_client')}>
            <Head title={t('app.create_client')} />

            <form onSubmit={submit} className="mt-12 space-y-8">
                {/* Baris Pertama: Nama dan Kontak */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('app.client_name')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder={t('app.client_name_placeholder')}
                        />

                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="contact">{t('app.client_contact')}</Label>
                        <Input
                            id="contact"
                            value={data.contact}
                            onChange={(e) => setData('contact', e.target.value)}
                            required
                            placeholder={t('app.client_contact_placeholder')}
                        />

                        <InputError message={errors.contact} />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                    <Label htmlFor="email">{t('app.client_email')}</Label>

                    <Label htmlFor="password">{t('app.client_password')}</Label>

                    <div>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder={t('app.client_email_placeholder')}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-6">
                        <Input
                            id="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder={t('app.client_password_placeholder')}
                        />
                        <Button type="button" variant="secondary" onClick={generatePassword}>
                            {t('app.generate_password')}
                        </Button>
                        <InputError message={errors.password} />
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-4 pt-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href={route('clients.index')}>{t('app.cancel')}</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {t('app.create_client_account')}
                    </Button>
                </div>
            </form>
        </MainLayout>
    );
}
