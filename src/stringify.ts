import {Parser} from 'pratt'
import {UsfmLexer} from './lexer'

function arrify(val) {
	if (val === null || val === undefined) {
		return ''
	}

	return val
}

function single(parser: Parser, bp: number, type: string) {
	parser.builder()
		.nud(type, bp, (t, bp) => '')
		.led(type, bp, (left, t, bp) => left.concat(''))
}

function value(parser: Parser, lex: UsfmLexer, bp: number, type: string) {
	parser.builder()
		.nud(type, bp, (t, bp) => parser.parse(bp))
		.led(type, bp, (left, t, bp) => left.concat(parser.parse(bp)))
}

function content(parser: Parser, lex: UsfmLexer, bp: number, type: string) {
	parser.builder()
		.nud(type, bp, (t, bp) => parser.parse(bp))
		.led(type, bp, (left, t, bp) => left.concat(parser.parse(bp)))
}

function ignoreEnclosed(parser: Parser, lex: UsfmLexer, bp: number, opener: string, closer: string = `${opener}*`, type: string = opener) {
	parser.builder()
		.bp(closer, -1)
		.either(opener, bp, (left, t, bp) => {
			const value = parser.parse(bp)
			lex.expect(closer)
			return arrify(left).concat('')
		})
}

function enclosed(parser: Parser, lex: UsfmLexer, bp: number, opener: string, closer: string = `${opener}*`, type: string = opener) {
	parser.builder()
		.bp(closer, -1)
		.either(opener, bp, (left, t, bp) => {
			const value = parser.parse(bp)
			lex.expect(closer)
			return arrify(left).concat(value)
		})
}

export class UsfmStringify extends Parser {
	start = 0

	constructor(lex: UsfmLexer) {
		super(lex)
		const builder = this.builder()
		builder.bp('$EOF', -1)
		builder.nud('TEXT', Number.MAX_VALUE, (t, bp) => t.match.replace(/(^(\r?\n)+|(\r?\n)+$)/g, ''))
		builder.led('TEXT', Number.MAX_VALUE, (left, t, bp) => left.concat(t.match.replace(/(^(\r?\n)+|(\r?\n)+$)/g, '')))

		// binding power
		// this controls operator precedence;
		// the higher the value, the tighter a token binds to the tokens that follow.
		let BP = 10

		BP += 10

		// \c
		// Chapter
		builder.led('c', BP, (left, t, bp) => {
			const num = parseInt(lex.expect('TEXT').match.trim())
			const id = this.start
			this.start++
			const content = this.parse(bp)
			return left.concat(content)
		})
		
		BP += 10

		// \p
		// Paragraph
		builder.either('p', BP, (left, t, bp) => {
			const content = this.parse(bp)
			return arrify(left).concat(content)
		})

		// \nb
		// No-break Paragraph
		builder.either('nb', BP, (left, t, bp) => {
			const content = this.parse(bp)
			return arrify(left).concat(content)
		})

		BP += 10

		// \v #
		// Verse
		builder.either('v', BP, (left, t, bp) => {
			const text = lex.peek().match
			const num = /^\s*(\d+)\s*/.exec(text)
			lex.lexer.position += num[0].length
			// Indexes rootID
			const id = this.start
			this.start++

			return arrify(left).concat(this.parse(bp))
		})
		
		BP += 10

		builder.either('h', BP, (left, t, bp) => {
			const text = lex.peek().match
			lex.lexer.position += text.length
			const id = this.start
			this.start++
			return arrify(left).concat(this.parse(bp))
		})

		// \p [text]
		// Line break
		content(this, lex, BP, 'br')

		// \b
		// Blank line
		single(this, BP, 'b')

		single(this, BP, 'li1')
		single(this, BP, 'm')
		single(this, BP, 'mi')
		single(this, BP, 'pc')
		single(this, BP, 'pi1')

		// \q#
		// Poetic line
		single(this, BP, 'q1')
		single(this, BP, 'q2')

		// \qm#
		// Embedded text poetic line.
		content(this, lex, BP, 'qm1')
		content(this, lex, BP, 'qm2')

		// \qr
		// Right-aligned poetic line.
		content(this, lex, BP, 'qr')

		// \qc
		// Centered poetic line.
		content(this, lex, BP, 'qc')

		// \qa
		// Acrostic heading.
		content(this, lex, BP, 'qa')

		// \qd
		// Hebrew note.
		content(this, lex, BP, 'qd')

		value(this, lex, BP, 'cl')
		value(this, lex, BP, 'cp')
		value(this, lex, BP, 'd')
		value(this, lex, BP, 'id')
		value(this, lex, BP, 'ide')
		value(this, lex, BP, 'ili')
		value(this, lex, BP, 'ili2')
		value(this, lex, BP, 'ip')
		value(this, lex, BP, 'is1')
		value(this, lex, BP, 'ms1')

		// \mt#
		// Major title.
		content(this, lex, BP, 'mt1')
		content(this, lex, BP, 'mt2')
		content(this, lex, BP, 'mt3')

		value(this, lex, BP, 's1')
		value(this, lex, BP, 'sp')
		value(this, lex, BP, 'toc1')
		value(this, lex, BP, 'toc2')
		value(this, lex, BP, 'toc3')

		BP += 10
		enclosed(this, lex, BP, 'add')
		ignoreEnclosed(this, lex, BP, 'bk')
		ignoreEnclosed(this, lex, BP, 'f')
		enclosed(this, lex, BP, 'k')

		// \qs ... \qs*
		enclosed(this, lex, BP, 'qs')

		// \qac ... \qac*
		// Acrostic letter within a poetic line
		enclosed(this, lex, BP, 'qac')

		enclosed(this, lex, BP, 'wj')
		ignoreEnclosed(this, lex, BP, 'x')

		BP += 10
		ignoreEnclosed(this, lex, BP, '+bk', '+bk*', 'bk')

		value(this, lex, BP, 'fl')
		value(this, lex, BP, 'fq')
		value(this, lex, BP, 'fr')
		value(this, lex, BP, 'ft')
		value(this, lex, BP, 'fqa')
		value(this, lex, BP, 'xo')
		value(this, lex, BP, 'xt')
	}
}
