import type {Bindings, Logger} from './types';
import {extendContext} from './extend-context';

export function debugInContexts(
  contexts: object[],
  bindings: Bindings,
  apiNamespace: string,
  logger: Logger
) {
  const extensionMap = new Map<string, () => unknown>();
  let api!: {
    resumeExecution: (value?: unknown) => void;
    failExecution: (reason?: unknown) => void;
  };
  const resultPromise = new Promise((resolve, reject) => {
    api = {resumeExecution: resolve, failExecution: reject};
  });

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
    extensionMap.set(key, getValue);
  }
  extensionMap.set(apiNamespace, () => api);

  const contextCleanups = contexts.map((context) => (
    extendContext(context as Record<string, unknown>, extensionMap, logger)
  ));
  logger.info(
    `Async function is paused for debugging. The following variables ` +
    `are available: [${[...extensionMap.keys()].sort().join(', ')}].`
  );
  const teardown = () => {
    logger.info('Async function execution is resumed.');
    for (const cleanup of contextCleanups) {
      cleanup();
    }
  };
  return {teardown, resultPromise, api};
}
