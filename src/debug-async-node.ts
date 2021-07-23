import {start as startREPL, ReplOptions} from 'repl';
import {prepareDebugAsync} from './prepare-debug-async';
import {API_NAMESPACE, Bindings, DebugAsyncCommonOptions, getLogger} from './core';

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
    const {resultPromise, applyToContext, api, startMessage, stopMessage} = (
      prepareDebugAsync(bindings, overrideProperties, apiNamespace, logger)
    );
    logger.info?.(startMessage);

    const teardowns = contexts.map(applyToContext);
    const repl = startREPL(replOptions);
    const exitPromise = new Promise<void>((resolve) => {
      repl.once('exit', () => {
        api.resumeExecution();
        resolve();
      });
    });
    if (!contexts.includes(globalThis)) {
      applyToContext(repl.context);
    }

    try {
      isBeingDebugged = true;
      return await resultPromise;
    } finally {
      for (const teardown of teardowns) {
        teardown();
      }
      repl.close();
      await exitPromise;
      isBeingDebugged = false;
      logger.info?.(stopMessage);
    }
  };
}
