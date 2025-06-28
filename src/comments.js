/**
 * Convert character position to line/column position
 * @param {string} source - The source code
 * @param {number} charPos - Character position
 * @returns {{ line: number, column: number }}
 */
function charPosToLineCol(source, charPos) {
	let line = 1;
	let column = 0;
	
	for (let i = 0; i < charPos && i < source.length; i++) {
		if (source[i] === '\n') {
			line++;
			column = 0;
		} else {
			column++;
		}
	}
	
	return { line, column };
}

/**
 * Add loc property to oxc-parser comments
 * @param {any[]} comments - Comments from oxc-parser
 * @param {string} source - Source code
 * @returns {any[]} Comments with loc property
 */
export function addLocToComments(comments, source) {
	return comments.map(comment => ({
		...comment,
		loc: {
			start: charPosToLineCol(source, comment.start),
			end: charPosToLineCol(source, comment.end)
		}
	}));
}

/**
 * Add loc property to all AST nodes
 * @param {any} node - AST node
 * @param {string} source - Source code
 */
export function addLocToASTNodes(node, source) {
	if (!node || typeof node !== 'object') return;
	
	// Add loc property if the node has start/end positions
	if (typeof node.start === 'number' && typeof node.end === 'number') {
		node.loc = {
			start: charPosToLineCol(source, node.start),
			end: charPosToLineCol(source, node.end)
		};
	}
	
	// Recursively process all properties
	for (const key in node) {
		if (key === 'loc') continue; // Skip the loc property we just added
		const value = node[key];
		
		if (Array.isArray(value)) {
			value.forEach(item => addLocToASTNodes(item, source));
		} else if (value && typeof value === 'object') {
			addLocToASTNodes(value, source);
		}
	}
}