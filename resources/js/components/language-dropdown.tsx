import { DropdownMenuItem, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';
import { DropdownMenuSub } from '@radix-ui/react-dropdown-menu';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { HTMLAttributes } from 'react';
import Flag from './flag';

export default function LanguageToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { language, updateLanguage } = useLanguage();
    const { setLocale } = useLaravelReactI18n();

    const getCurrentIcon = () => {
        switch (language) {
            case 'id':
                return <Flag variant="id" className="mr-2" />;
            case 'en':
                return <Flag variant="en" className="mr-2" />;
            default:
                return <Flag variant="en" className="mr-2" />;
        }
    };

    const { t } = useLaravelReactI18n();

    return (
        <div className={className} {...props}>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <div className="relative flex w-full cursor-default items-center gap-2 rounded-sm text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive-foreground dark:data-[variant=destructive]:focus:bg-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground">
                        {getCurrentIcon()}
                        {t('app.change_language')}
                    </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem
                            onClick={() => {
                                updateLanguage('en');
                                setLocale('en');
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <Flag variant="en" className="h-5 w-5" />
                                {t('app.english')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                updateLanguage('id');
                                setLocale('id');
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <Flag variant="id" className="h-5 w-5" />
                                {t('app.indonesian')}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        </div>
    );
}
