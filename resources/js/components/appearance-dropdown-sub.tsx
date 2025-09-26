import { DropdownMenuItem, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { DropdownMenuSub } from '@radix-ui/react-dropdown-menu';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="mr-2" />;
            case 'light':
                return <Sun className="mr-2" />;
            default:
                return <Monitor className="mr-2" />;
        }
    };

    const { t } = useLaravelReactI18n();

    return (
        <div className={className} {...props}>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <div className="relative flex w-full cursor-default items-center gap-2 rounded-sm text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive-foreground dark:data-[variant=destructive]:focus:bg-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground">
                        {getCurrentIcon()}
                        {t('app.change_theme')}
                    </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => updateAppearance('light')}>
                            <span className="flex items-center gap-2">
                                <Sun className="h-5 w-5" />
                                {t('app.light')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateAppearance('dark')}>
                            <span className="flex items-center gap-2">
                                <Moon className="h-5 w-5" />
                                {t('app.dark')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateAppearance('system')}>
                            <span className="flex items-center gap-2">
                                <Monitor className="h-5 w-5" />
                                {t('app.system')}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        </div>
    );
}
