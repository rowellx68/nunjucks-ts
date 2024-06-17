import { Token, lexer } from './lexer'
import {
  ImportAliasKeyNode,
  ImportAliasValueNode,
  ImportNameAliasNode,
  ImportNameValueNode,
  ImportNamesNode,
  ImportNode,
  ImportTargetNode,
  Root,
  ImportTemplate,
  CommentNode,
  IncludeTemplateNode,
  IncludeTemplateLeftNode,
  IncludeTemplateValueNode,
  IncludeTemplateExpressionNode,
  IncludeTemplateRightNode,
} from './nodes'
import { Node, Position } from 'unist'

function tokenToPosition(token: Token): Position {
  return {
    start: { line: token.line, column: token.column },
    end: {
      line: token.line,
      column: token.column + token.value.length,
    },
  }
}

function parseImportFrom(tokens: Generator<void | Token>): ImportNode {
  let currentToken = tokens.next()

  while (currentToken.value.type !== 'string') {
    currentToken = tokens.next()
  }

  const template = new ImportTemplate(
    currentToken.value.value,
    tokenToPosition(currentToken.value),
  )

  let withContext = false
  let maybeWithContext = false
  let withAlias = false
  let importNames: ImportNamesNode['children'] = []

  do {
    if (currentToken.value.type === 'symbol') {
      switch (currentToken.value.value) {
        case 'with':
          maybeWithContext = true
          break
        case 'context':
          withContext = maybeWithContext
          maybeWithContext = false
          break
        case 'import':
          break
        case 'as':
          withAlias = true
          break
        default:
          if (withAlias) {
            withAlias = false
            const idx = importNames.length - 1
            const existing = importNames[idx] as ImportNameValueNode
            // replace the existing node with an alias node
            const aliasKey = new ImportAliasKeyNode(
              existing.value,
              existing.position,
            )
            const aliasValue = new ImportAliasValueNode(
              currentToken.value.value,
              tokenToPosition(currentToken.value),
            )

            importNames[idx] = new ImportNameAliasNode(aliasKey, aliasValue)
            break
          }

          importNames.push(
            new ImportNameValueNode(
              currentToken.value.value,
              tokenToPosition(currentToken.value),
            ),
          )
      }
    }
  } while (
    (currentToken = tokens.next()) &&
    currentToken.value &&
    currentToken.value.type !== 'block-end'
  )

  return new ImportNode(template, withContext, new ImportNamesNode(importNames))
}

function parseDirectImport(tokens: Generator<void | Token>): ImportNode {
  let currentToken = tokens.next()

  while (currentToken.value.type !== 'string') {
    currentToken = tokens.next()
  }

  const template = new ImportTemplate(
    currentToken.value.value,
    tokenToPosition(currentToken.value),
  )

  let withContext = false
  let maybeWithContext = false
  let withAlias = false
  let target: ImportTargetNode | undefined

  do {
    if (currentToken.value.type === 'symbol') {
      switch (currentToken.value.value) {
        case 'with':
          maybeWithContext = true
          break
        case 'context':
          withContext = maybeWithContext
          maybeWithContext = false
          break
        case 'as':
          withAlias = true
          break
        default:
          if (withAlias) {
            withAlias = false
            target = new ImportTargetNode(
              currentToken.value.value,
              tokenToPosition(currentToken.value),
            )
            break
          }
      }
    }
  } while (
    (currentToken = tokens.next()) &&
    currentToken.value &&
    currentToken.value.type !== 'block-end'
  )

  if (!target) {
    throw new Error('Missing alias for import')
  }

  return new ImportNode(template, withContext, target)
}

function parseComment(token: Token): CommentNode {
  const trimLeft = /^\{#-\s/.test(token.value)
  const trimRight = /\s-#\}$/.test(token.value)
  const content = token.value.replace(/(\{#-?\s+?)|(\s+?-?#\})/g, '')

  return new CommentNode(content, trimLeft, trimRight, {
    start: { line: token.line, column: token.column + (trimLeft ? 4 : 3) },
    end: {
      line: token.line,
      column: token.column + content.length + (trimRight ? 4 : 3),
    },
  })
}

function parseInclude(tokens: Generator<void | Token>): IncludeTemplateNode {
  let currentToken = tokens.next()

  while (currentToken.value.type !== 'symbol') {
    currentToken = tokens.next()
  }

  let withIgnoreMissing = false
  let maybeIgnoreMissing = false
  let target: IncludeTemplateValueNode | undefined
  let left: IncludeTemplateLeftNode | undefined
  let right: IncludeTemplateLeftNode | undefined

  do {
    if (currentToken.value.type === 'symbol') {
      switch (currentToken.value.value) {
        case 'ignore':
          maybeIgnoreMissing = true
          break
        case 'missing':
          withIgnoreMissing = maybeIgnoreMissing
          maybeIgnoreMissing = false
          break
        default:
          left = new IncludeTemplateLeftNode(
            currentToken.value.value,
            tokenToPosition(currentToken.value),
          )
      }
    } else if (currentToken.value.type === 'string') {
      target = new IncludeTemplateValueNode(
        currentToken.value.value,
        tokenToPosition(currentToken.value),
      )
    }
  } while (
    (currentToken = tokens.next()) &&
    currentToken.value &&
    currentToken.value.type !== 'block-end'
  )

  const valueOrExpression = left
    ? new IncludeTemplateExpressionNode(
        left,
        new IncludeTemplateRightNode(target.value, target.position),
        tokenToPosition(currentToken.value),
      )
    : target

  return new IncludeTemplateNode(withIgnoreMissing, valueOrExpression)
}

export function parse(input: string): Root {
  const tokens = lexer(input)

  const children: Node[] = []

  for (const token of tokens) {
    if (!token) {
      break
    }

    if (token.type === 'block-start') {
      let next = tokens.next()

      while (next.value && next.value.type !== 'symbol') {
        next = tokens.next()
      }

      if (!next.value) {
        break
      }

      switch (next.value.value) {
        case 'from':
          // parse import
          children.push(parseImportFrom(tokens))
          break
        case 'import':
          // parse direct import
          children.push(parseDirectImport(tokens))
          break
        case 'include':
          // parse include
          children.push(parseInclude(tokens))
          break
        case 'set':
          // parse set
          console.log('set')
          break
        case 'if':
          // parse if, elif, else
          break
        case 'macro':
          // parse macro
          break
        default:
          break
      }
    } else if (token.type === 'comment') {
      children.push(parseComment(token))
    }
  }

  return new Root(children)
}
