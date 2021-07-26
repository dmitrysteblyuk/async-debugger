import {prepareDebugAsync} from './prepare-debug-async';
import {
  API_NAMESPACE,
  Bindings,
  DebugAsyncCommonOptions,
  getLogger,
} from './core';
import {extendContext} from './extend-context';

export const debugAsync = createDebugAsyncBrowser();
export interface DebugAsyncBrowserOptions extends DebugAsyncCommonOptions {}

export function createDebugAsyncBrowser({
  defaults: {
    contexts: contextsDefault = [globalThis],
    overrideProperties: overridePropertiesDefault = true,
    apiNamespace: apiNamespaceDefault = API_NAMESPACE,
    logger: loggerDefault,
  } = {},
}: {
  defaults?: DebugAsyncBrowserOptions;
} = {}) {
  let isBeingDebugged = false;

  return async (bindings: Bindings, options: DebugAsyncBrowserOptions = {}) => {
    if (isBeingDebugged) {
      // Better to just ignore.
      return;
    }
    const {
      contexts = contextsDefault,
      overrideProperties = overridePropertiesDefault,
      apiNamespace = apiNamespaceDefault,
      logger: loggerOptions = loggerDefault,
    } = options;
    const logger = getLogger(loggerOptions);
    const {resultPromise, extension, startMessage, stopMessage} =
      prepareDebugAsync(bindings, apiNamespace);
    logger.info?.(startMessage);
    const cleanups = contexts.map((context) =>
      extendContext(
        context as Record<string, () => unknown>,
        extension,
        overrideProperties,
        logger,
      ),
    );

    try {
      isBeingDebugged = true;
      return await resultPromise;
    } finally {
      isBeingDebugged = false;
      for (const cleanup of cleanups) {
        cleanup();
      }
      logger.info?.(stopMessage);
    }
  };
}
