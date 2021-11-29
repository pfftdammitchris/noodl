import ts from 'typescript'

function NoodlTransformPlugin(options) {
  function visitor<N extends ts.Node>(
    ctx: ts.TransformationContext,
    sourceFile: ts.SourceFile,
  ) {
    const visitor: ts.Visitor = (node: N): ts.VisitResult<N> => {
      return ts.visitEachChild<N>(node, visitor, ctx)
    }

    return visitor
  }

  return (ctx: ts.TransformationContext): ts.Transformer<ts.Node> => {
    return (sourceFile: ts.SourceFile) =>
      ts.visitNode(sourceFile, visitor(ctx, sourceFile))
  }
}
