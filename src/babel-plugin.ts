import {parseSync} from '@babel/core';
import type * as core from '@babel/core';
import * as types from '@babel/types';

const DEBUGGER_LITERAL = 'debugger';
const DEBUG_ASYNC_FUNCTION = '__debugAsync__';
const IMPORT_DEBUG_ASYNC_LINE_DEFAULT = (
  `const {debugAsync: ${DEBUG_ASYNC_FUNCTION}} = require('async-debugger');`
);

export = (
  _api: {},
  {
    importDebugAsyncLine = IMPORT_DEBUG_ASYNC_LINE_DEFAULT
  }: {
    importDebugAsyncLine?: string;
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
      let requiresPauseToDebug = false;
      for (const path of awaitDebuggerExpressions) {
        if (handleAwaitDebuggerExpression(path)) {
          requiresPauseToDebug = true;
        }
      }
      if (requiresPauseToDebug) {
        addPauseToDebugRequire(file.path, importDebugAsyncLine);
      }
    }
  };
};

function addPauseToDebugRequire(
  path: core.NodePath<types.Program>,
  importDebugAsyncLine: string
) {
  const result = parseSync(importDebugAsyncLine);
  if (result === null) {
    return;
  }
  const {body} = types.isFile(result) ? result.program : result;
  path.unshiftContainer('body', body);
}

function handleAwaitDebuggerExpression(
  path: core.NodePath<types.AwaitExpression>
) {
  let variableNames: string[] = [];
  path.find((parent) => {
    if (parent.isScopable()) {
      variableNames = [...variableNames, ...Object.keys(parent.scope.bindings)];
    }
    return false;
  });
  const set = new Set(variableNames);
  const requiresPauseToDebug = !set.has(DEBUG_ASYNC_FUNCTION);
  variableNames = [...set];

  path.replaceWith(
    types.sequenceExpression([
      types.awaitExpression(
        types.callExpression(types.identifier(DEBUG_ASYNC_FUNCTION), [
          types.objectExpression(variableNames.map((name) => (
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
  return requiresPauseToDebug;
}
