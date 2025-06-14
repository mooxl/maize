import emojis from '@/data/emojis.json';
import { Extension, InputRule } from '@tiptap/core';

export const EmojiReplacer = Extension.create({
	name: 'emojiReplacer',
	addInputRules() {
		return [
			new InputRule({
				find: /:([a-zA-Z0-9_]+):/g,
				handler: ({ range, match, commands }) => {
					const [, emojiName] = match;
					if (!emojiName) return;
					const emojiChar =
						emojiName in emojis
							? emojis[emojiName as keyof typeof emojis]
							: undefined;
					if (emojiChar) {
						commands.deleteRange(range);
						commands.insertContent(emojiChar);
					}
				},
			}),
		];
	},
});
