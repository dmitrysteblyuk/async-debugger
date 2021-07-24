import type {Bindings} from './core';
import {logKeys} from './utils';

export function prepareDebugAsync(bindings: Bindings, apiNamespace: string) {
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
    'Async function is paused for debugging. The following variables ' +
    `are available: ${logKeys(extension.keys())}.`
  );
  const stopMessage = 'Async function execution is resumed.';

  return {extension, resultPromise, api, startMessage, stopMessage};
}
