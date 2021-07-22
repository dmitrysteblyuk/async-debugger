import {createDebuggerAPI} from './create-debugger-api';
import type {Bindings, DebugAsyncCommonOptions, Logger} from './types';

export const debugAsync = createDebugAsyncBrowser();
export interface DebugAsyncBrowserOptions extends DebugAsyncCommonOptions {}

export function createDebugAsyncBrowser(
  {
    defaults: {
      contexts: contextsDefault = [globalThis],
      logger: defaultLogger = {},
      apiNamespace: apiNamespaceDefault = 'AsyncDebugger'
    } = {}
  }: {
    defaults?: DebugAsyncBrowserOptions
  } = {}
) {
  let isBeingDebugged = false;

  return async (
    bindings: Bindings,
    options: DebugAsyncBrowserOptions = {}
  ) => {
    if (isBeingDebugged) {
      // Better to just ignore.
      return;
    }
    const {
      contexts = contextsDefault,
      apiNamespace = apiNamespaceDefault,
      logger: {info = console.info, warn = console.warn} = defaultLogger
    } = options;
    const logger: Logger = {info, warn};
    const {resultPromise, applyToContexts} = (
      createDebuggerAPI(bindings, apiNamespace, logger)
    );
    const teardown = applyToContexts(contexts);

    try {
      isBeingDebugged = true;
      return await resultPromise;
    } finally {
      isBeingDebugged = false;
      teardown();
    }
  };
}
