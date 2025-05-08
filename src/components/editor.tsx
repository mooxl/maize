import { useFocusRing } from '@react-aria/focus';
import {
	BubbleMenu,
	EditorContent,
	FloatingMenu,
	useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { textareaStyles } from './ui/textarea';

const extensions = [StarterKit];

interface EditorProps {
	content?: string;
	onChange?: (content: string) => void;
}

export const Editor = ({
	content = '<p>Hello World!</p>',
	onChange,
}: EditorProps) => {
	const { isFocused, focusProps } = useFocusRing();
	console.log(isFocused);
	const editor = useEditor({
		extensions,
		content,
		editorProps: {
			attributes: {
				class:
					'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
			},
		},
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
	});

	return (
		<section className="flex flex-col gap-y-4">
			<div {...focusProps} data-focused={isFocused ?? undefined}>
				<EditorContent editor={editor} className={textareaStyles()} />
				<FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
				<BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
			</div>
		</section>
	);
};
