import type {Bindings, Logger} from './core';
import {extendContext} from './extend-context';

export function prepareDebugAsync(
  bindings: Bindings,
  overrideProperties: boolean,
  apiNamespace: string,
  logger: Logger
) {
  let api!: {
    resumeExecution: (value?: unknown) => void;
    failExecution: (reason?: unknown) => void;
  };
  const resultPromise = new Promise((resolve, reject) => {
    api = {resumeExecution: resolve, failExecution: reject};
  });
  const extension = new Map<string, () => unknown>();

  for (const key in bindings) {
    if (!bindings.hasOwnProperty(key)) {
      continue;
    }
    const getValue = bindings[key];
    try {
      getValue();
    } catch (error: unknown) {
      if (error instanceof ReferenceError) {
        // Variables can be declared after `await "debugger"` statement.
        continue;
      }
      throw error;
    }
    extension.set(key, getValue);
  }
  extension.set(apiNamespace, () => api);

  const startMessage = (
    `Async function is paused for debugging. The following variables ` +
    `are available: [${[...extension.keys()].sort().join(', ')}].`
  );
  const stopMessage = 'Async function execution is resumed.';
  const applyToContext = (context: object) => extendContext(
    context as Record<string, unknown>,
    extension,
    overrideProperties,
    logger
  );
  return {applyToContext, resultPromise, api, startMessage, stopMessage};
}
