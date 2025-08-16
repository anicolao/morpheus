import type Token from 'markdown-it/lib/token';

function attrSet(token: Token, name: string, value: string) {
	const index = token.attrIndex(name);
	const attr = [name, value];

	if (index < 0) {
		token.attrPush(attr);
	} else {
		token.attrs[index] = attr;
	}
}

function parentToken(tokens: Token[], index: number) {
	const targetLevel = tokens[index].level - 1;
	for (let i = index - 1; i >= 0; i--) {
		if (tokens[i].level === targetLevel) {
			return i;
		}
	}
	return -1;
}

function isTodoItem(tokens: Token[], index: number) {
	return tokens[index].type === 'inline' &&
	       tokens[index - 1].type === 'paragraph_open' &&
	       tokens[index - 2].type === 'list_item_open' &&
	       /^\[[xX \u00A0]\][ \u00A0]/.test(tokens[index].content);
}

function todoify(token: Token, TokenConstructor: any) {
	token.children![0].content = token.children![0].content.slice(3);
	const checkbox = new TokenConstructor('text', '', 0);
	const checked = /^\[[xX]\][ \u00A0]/.test(token.content);
	checkbox.content = checked ? '☑' : '☐';
	token.children!.unshift(checkbox);
}

export default function unicodeCheckbox(md: any) {
	md.core.ruler.after('inline', 'unicode-task-lists', function(state: any) {
		const tokens = state.tokens;
		for (let i = 2; i < tokens.length; i++) {
			if (isTodoItem(tokens, i)) {
				todoify(tokens[i], state.Token);
				const parent = parentToken(tokens, i - 2);
				if (parent !== -1) {
					attrSet(tokens[parent], 'style', 'list-style-type: none;');
				}
			}
		}
	});
}
