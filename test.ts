import { UsfmLexer, UsfmParser } from './src'

const content = '\\c 1  \n' +
    '\\p\n' +
    '\\v 1 In the beginning, God\\f + \\fr 1:1  \\ft The Hebrew word rendered “God” is “אֱלֹהִ֑ים” (Elohim).\\f* created the heavens and the earth. \n' +
    '\\v 2 The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters. \n' +
    '\\p\n' +
    '\\v 3 God said, “Let there be light,” and there was light. \n' +
    '\\v 4 God saw the light, and saw that it was good. God divided the light from the darkness. \n' +
    '\\v 5 God called the light “day”, and the darkness he called “night”. There was evening and there was morning, the first day. \n' +
    '\\p\n' +
    '\\v 6 God said, “Let there be an expanse in the middle of the waters, and let it divide the waters from the waters.” \n' +
    '\\v 7 God made the expanse, and divided the waters which were under the expanse from the waters which were above the expanse; and it was so. \n' +
    '\\v 8 God called the expanse “sky”. There was evening and there was morning, a second day. \n' +
    '\\p\n'

class Test {
    static main() {
        const usfmLexer = new UsfmLexer()
        usfmLexer.lexer.source = `\n${content}`
        const usfmParser = new UsfmParser(usfmLexer)
        usfmParser.start = 1
        const result = usfmParser.parse()
        console.log(JSON.stringify(result))
    }
}

Test.main()