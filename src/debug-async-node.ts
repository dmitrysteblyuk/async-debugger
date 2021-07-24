import {start as startREPL, ReplOptions} from 'repl';
import {prepareDebugAsync} from './prepare-debug-async';
import {API_NAMESPACE, Bindings, DebugAsyncCommonOptions, getLogger} from './core';
import {extendContext} from './extend-context';

export const debugAsync = createDebugAsyncNode();
export interface DebugAsyncNodeOptions extends DebugAsyncCommonOptions {
  replOptions?: ReplOptions;
}
export function createDebugAsyncNode(
  {
    defaults: {
      contexts: contextsDefault = [globalThis],
      overrideProperties: overridePropertiesDefault = true,
      apiNamespace: apiNamespaceDefault = API_NAMESPACE,
      logger: loggerDefault,
      replOptions: replOptionsDefault
    } = {}
  }: {
    defaults?: DebugAsyncNodeOptions
  } = {}
) {
  let isBeingDebugged = false;

  return async (
    bindings: Bindings,
    options: DebugAsyncNodeOptions = {}
  ) => {
    if (isBeingDebugged) {
      // Better to just ignore.
      return;
    }
    const {
      contexts = contextsDefault,
      overrideProperties = overridePropertiesDefault,
      apiNamespace = apiNamespaceDefault,
      logger: defaultLogger = loggerDefault,
      replOptions = replOptionsDefault
    } = options;
    const logger = getLogger(defaultLogger);
    const {resultPromise, extension, api, startMessage, stopMessage} = (
      prepareDebugAsync(bindings, apiNamespace)
    );
    logger.info?.(startMessage);

    const cleanups = contexts.map((context) => extendContext(
      context as Record<string, () => unknown>,
      extension,
      overrideProperties,
      logger
    ));
    const repl = startREPL(replOptions);
    const exitPromise = new Promise<void>((resolve) => {
      repl.once('exit', () => {
        api.resumeExecution();
        resolve();
      });
    });

    try {
      extendContext(repl.context, extension, true, {...logger, warn: null});
      isBeingDebugged = true;
      return await resultPromise;
    } finally {
      repl.close();
      await exitPromise;
      isBeingDebugged = false;
      for (const cleanup of cleanups) {
        cleanup();
      }
      logger.info?.(stopMessage);
    }
  };
}
