import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import YooptaEditor, { createYooptaEditor, type YooptaContentValue, type YooptaOnChangeOptions } from '@yoopta/editor';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Image from '@yoopta/image';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';
import { BulletedList, NumberedList } from '@yoopta/lists';
import Paragraph from '@yoopta/paragraph';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useMemo, useState } from 'react';

// Tools should be defined outside component
const TOOLS = {
    Toolbar: {
        tool: Toolbar,
        render: DefaultToolbarRender,
    },
    ActionMenu: {
        tool: ActionMenu,
        render: DefaultActionMenuRender,
    },
    LinkTool: {
        tool: LinkTool,
        render: DefaultLinkToolRender,
    },
};
const plugins: any = [Paragraph, Image, HeadingOne, HeadingTwo, HeadingThree, BulletedList, NumberedList];

export default function Editor() {
    const editor = useMemo(() => createYooptaEditor(), []);
    const [value, setValue] = useState<YooptaContentValue>();

    const onChange = (value: YooptaContentValue, options: YooptaOnChangeOptions) => {
        setValue(value);
    };

    const { t } = useLaravelReactI18n();

    return (
        <div className="w-full border px-8">
            <input type="text" name="title" id="title" placeholder={t('app.title')} className="text-6xl font-bold focus-within:ring-0 focus:ring-0" />
            <YooptaEditor editor={editor} plugins={plugins} value={value} tools={TOOLS} onChange={onChange} />
        </div>
    );
}
