// http://ubs-icap.org/chm/usfm/2.4/index.html
import {IToken} from 'pratt'
import Lexer from 'perplex/lib/lexer'

export class UsfmLexer {
	public lexer: Lexer
	constructor(s?: string) {
		this.lexer = new Lexer(s)
		this.lexer.token('TAG', /\\\+?[a-oq-z0-9]+\*?\s*/i)
		this.lexer.token('TEXT', /[^\\]+/)
		this.lexer.token('P_GROUP', /\\p\s*/i)
		this.lexer.token('P', /\\\+?[p]+\*?\s+\w+/i)
	}

	private _tkn(t: IToken) {
		if (t.type == 'TAG')
			t.type = t.match.replace(/^\\/, '').trim()
		if (t.type == 'P_GROUP')
			t.type = 'p_group'
		if (t.type == 'P')
			t.type = 'p'
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
