import { Parent, Node, Literal, Position } from 'unist'

export class Root implements Parent {
  readonly type = 'Root'

  constructor(
    public children: Node[],
    public position?: Position,
  ) {}
}

export class ImportTemplate implements Literal {
  readonly type = 'ImportTemplate'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class ImportNameValueNode implements Literal {
  readonly type = 'ImportNameValueNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class ImportAliasKeyNode implements Literal {
  readonly type = 'ImportAliasKeyNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class ImportAliasValueNode implements Literal {
  readonly type = 'ImportAliasValueNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class ImportNameAliasNode implements Node {
  readonly type = 'ImportNameAliasNode'

  constructor(
    public key: ImportAliasKeyNode,
    public value: ImportAliasValueNode,
    public position?: Position,
  ) {}
}

export class ImportNamesNode implements Parent {
  readonly type = 'ImportNamesNode'

  constructor(
    public children: (ImportNameAliasNode | ImportNameValueNode)[],
    public position?: Position,
  ) {}
}

export class ImportTargetNode implements Literal {
  readonly type = 'ImportTargetNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class ImportNode implements Node {
  readonly type = 'ImportNode'
  names?: ImportNamesNode
  target?: ImportTargetNode

  constructor(
    public template: ImportTemplate,
    public withContext: boolean,
    /**
     * This will not be serialized to the AST, but is used to determine
     * whether the import is a "from" import or a direct import.
     */
    namesOrTarget: ImportNamesNode | ImportTargetNode,
    public position?: Position,
  ) {
    if (namesOrTarget instanceof ImportNamesNode) {
      this.names = namesOrTarget
    } else if (namesOrTarget instanceof ImportTargetNode) {
      this.target = namesOrTarget
    }
  }
}

export class CommentNode implements Literal {
  readonly type = 'CommentNode'

  constructor(
    public value: string,
    public trimLeft: boolean,
    public trimRight: boolean,
    public position?: Position,
  ) {}
}

export class IncludeTemplateValueNode implements Literal {
  readonly type = 'IncludeTemplateValueNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class IncludeTemplateLeftNode implements Literal {
  readonly type = 'IncludeTemplateLeftNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class IncludeTemplateRightNode implements Literal {
  readonly type = 'IncludeTemplateRightNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class IncludeTemplateExpressionNode implements Node {
  readonly type = 'IncludeTemplateExpressionNode'

  constructor(
    public left: IncludeTemplateLeftNode,
    public right: IncludeTemplateRightNode,
    public position?: Position,
  ) {}
}

export class IncludeTemplateNode implements Node {
  readonly type = 'IncludeTemplateNode'
  value?: IncludeTemplateValueNode
  left?: IncludeTemplateLeftNode
  right?: IncludeTemplateRightNode

  constructor(
    public ignoreMissing: boolean,
    valueOrExpression: IncludeTemplateValueNode | IncludeTemplateExpressionNode,
    public position?: Position,
  ) {
    if (valueOrExpression instanceof IncludeTemplateValueNode) {
      this.value = valueOrExpression
    } else if (valueOrExpression instanceof IncludeTemplateExpressionNode) {
      this.left = valueOrExpression.left
      this.right = valueOrExpression.right
    }
  }
}

export class SetTargetNode implements Literal {
  readonly type = 'SetTargetNode'

  constructor(
    public value: string,
    public position?: Position,
  ) {}
}

export class SetValNode implements Literal {
  readonly type = 'SetValNode'

  constructor(
    public value: unknown,
    public position?: Position,
  ) {}
}

export class SetNode implements Node {
  readonly type = 'SetNode'
  value?: SetValNode

  constructor(
    public targets: SetTargetNode[],
    valueOrBody: SetValNode | null,
    public position?: Position,
  ) {}
}
