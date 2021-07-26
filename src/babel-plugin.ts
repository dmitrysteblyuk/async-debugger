import {parseSync} from '@babel/core';
import type * as core from '@babel/core';
import * as types from '@babel/types';

const DEBUGGER_LITERAL = 'debugger';
const DEBUG_ASYNC_FUNCTION = '__debugAsync__';
const DEBUG_ASYNC_DECLARATION_DEFAULT = (
  `const {debugAsync: ${DEBUG_ASYNC_FUNCTION}} = require('async-debugger');`
);

export = (
  _api: {},
  {
    debugAsyncDeclarationHeader = DEBUG_ASYNC_DECLARATION_DEFAULT
  }: {
    debugAsyncDeclarationHeader?: string;
  } = {}
): core.PluginObj => {
  const awaitDebuggerExpressions = new Set<core.NodePath<types.AwaitExpression>>();
  return {
    visitor: {
      StringLiteral(path) {
        if (
          path.node.value === DEBUGGER_LITERAL &&
          path.parentPath.isAwaitExpression()
        ) {
          awaitDebuggerExpressions.add(path.parentPath);
        }
      }
    },
    post(file) {
      let requiresDebugAsyncDeclaration = false;
      for (const path of awaitDebuggerExpressions) {
        if (handleAwaitDebuggerExpression(path)) {
          requiresDebugAsyncDeclaration = true;
        }
      }
      if (requiresDebugAsyncDeclaration) {
        insertDebugAsyncDeclarationHeader(file.path, debugAsyncDeclarationHeader);
      }
    }
  };
};

function insertDebugAsyncDeclarationHeader(
  path: core.NodePath<types.Program>,
  debugAsyncDeclarationHeader: string
) {
  const result = parseSync(debugAsyncDeclarationHeader);
  if (result === null) {
    return;
  }
  const {body} = types.isFile(result) ? result.program : result;
  path.unshiftContainer('body', body);
}

function handleAwaitDebuggerExpression(
  path: core.NodePath<types.AwaitExpression>
) {
  const variableScopes: string[][] = [];
  path.find((parent) => {
    if (parent.isScopable()) {
      variableScopes.push(Object.keys(parent.scope.bindings));
    }
    return false;
  });
  const allVariables = new Set(variableScopes.flat());
  const requiresDebugAsyncDeclaration = !allVariables.has(DEBUG_ASYNC_FUNCTION);

  path.replaceWith(
    types.sequenceExpression([
      types.awaitExpression(
        types.callExpression(types.identifier(DEBUG_ASYNC_FUNCTION), [
          types.objectExpression([...allVariables].map((name) => (
            types.objectProperty(
              types.identifier(name),
              types.arrowFunctionExpression([], types.identifier(name))
            )
          )))
        ])
      ),
      path.node
    ])
  );
  return requiresDebugAsyncDeclaration;
}
