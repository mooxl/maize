import {
	Link,
	RichTextEditor,
	type RichTextEditorProps,
} from '@mantine/tiptap';
import { BubbleMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EmojiReplacer } from '../utils/emoji-replacer';

type Props = {
	content: string;
	onChange?: (content: string) => void;
	editable?: boolean;
} & Omit<RichTextEditorProps, 'editor' | 'children'>;

export const Editor = ({
	content,
	onChange,
	editable = true,
	...props
}: Props) => {
	const editor = useEditor({
		extensions: [StarterKit, Link, EmojiReplacer],
		content,
		editable,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
	});

	if (!editor) return null;

	return (
		<RichTextEditor
			editor={editor}
			classNames={{
				content: ' flex-auto text-base! ',
				root: 'border-gray-200! overflow-y-auto!',
			}}
			{...props}
		>
			{editable && (
				<BubbleMenu editor={editor}>
					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Bold />
						<RichTextEditor.Italic />
						<RichTextEditor.Link />
					</RichTextEditor.ControlsGroup>
				</BubbleMenu>
			)}

			<RichTextEditor.Content />
		</RichTextEditor>
	);
};
