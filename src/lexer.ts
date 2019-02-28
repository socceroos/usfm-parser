// http://ubs-icap.org/chm/usfm/2.4/index.html
import {IToken} from 'pratt'
import Lexer from 'perplex/lib/lexer'

export class UsfmLexer {
	public lexer: Lexer
	constructor(s?: string) {
		this.lexer = new Lexer(s)
		this.lexer
			.token('TAG', /\\\+?[^p]{1}\w?\*?\s*/i)
			.token('TEXT', /[^\\]+/)
			.token('P', /^\\p\s?\n/i)
			.token('BR', /^\\p\s/i)
	}

	private _tkn(t: IToken) {
		if (t.type == 'TAG')
			t.type = t.match.replace(/^\\/, '').trim()
		if (t.type == 'P')
			t.type = 'p'
		if (t.type == 'BR')
			t.type = 'br'
		return t
	}

	peek(): IToken {
		return this._tkn(this.lexer.peek())
	}

	next(): IToken {
		return this._tkn(this.lexer.next())
	}

	expect(type: string): IToken {
		const token = this.lexer.next()
		const surrogateType = token.type == 'TAG' ? token.match.replace(/^\\/, '').trim() : token.type
		if (surrogateType != type) {
			const {start} = token.strpos()
			throw new Error(`Expected ${type}, got ${surrogateType} (at ${start.line}:${start.column})`)
		}
		return token
	}
}
