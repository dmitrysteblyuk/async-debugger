import {debugInContexts} from './debug-in-contexts';
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

    const {resultPromise, teardown} = (
      debugInContexts(contexts, bindings, apiNamespace, logger)
    );
    try {
      isBeingDebugged = true;
      return await resultPromise;
    } finally {
      isBeingDebugged = false;
      teardown();
    }
  };
}
