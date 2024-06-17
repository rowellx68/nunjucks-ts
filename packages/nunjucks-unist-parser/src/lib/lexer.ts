import { lex } from 'nunjucks/src/lexer'

type TokenType =
  | 'string'
  | 'whitespace'
  | 'data'
  | 'block-start'
  | 'block-end'
  | 'variable-start'
  | 'variable-end'
  | 'comment'
  | 'left-paren'
  | 'right-paren'
  | 'left-bracket'
  | 'right-bracket'
  | 'left-curly'
  | 'right-curly'
  | 'operator'
  | 'comma'
  | 'colon'
  | 'tilde'
  | 'pipe'
  | 'int'
  | 'float'
  | 'boolean'
  | 'none'
  | 'symbol'
  | 'special'
  | 'regex'

type NjkToken = {
  type: TokenType
  value: string
  // Nunjucks uses 0-based line and column numbers
  lineno: number
  colno: number
}

export class Token {
  constructor(
    public type: TokenType,
    public value: string,
    // unist uses 1-based line and column numbers
    public line: number,
    public column: number,
  ) {}
}

// generator function that yields tokens
function* tokeniser(lexicon: { nextToken: () => NjkToken | null }) {
  while (true) {
    const njkToken = lexicon.nextToken()

    if (!njkToken) {
      break
    }

    yield new Token(njkToken.type, njkToken.value, njkToken.lineno + 1, njkToken.colno + 1)
  }
}

export function* lexer(input: string) {
  const tokens = tokeniser(lex(input))

  while (true) {
    const token = tokens.next()

    if (token.done) {
      break
    }

    yield token.value
  }
}
