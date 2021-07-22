import {start as startRepl, ReplOptions} from 'repl';
import {debugInContexts} from './debug-in-contexts';
import type {Bindings, DebugAsyncCommonOptions, Logger} from './types';

export const debugAsync = createDebugAsyncNode();
export interface DebugAsyncNodeOptions extends DebugAsyncCommonOptions {
  replOptions?: ReplOptions;
}

export function createDebugAsyncNode(
  {
    defaults: {
      contexts: contextsDefault = [globalThis],
      logger: defaultLogger = {},
      apiNamespace: apiNamespaceDefault = 'AsyncDebugger',
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
      apiNamespace = apiNamespaceDefault,
      logger: {info = console.info, warn = console.warn} = defaultLogger,
      replOptions = replOptionsDefault
    } = options;
    const logger: Logger = {info, warn};

    const repl = startRepl(replOptions);
    const {resultPromise, teardown, api} = (
      debugInContexts([...contexts, repl.context], bindings, apiNamespace, logger)
    );
    repl.once('exit', api.resumeExecution);

    try {
      isBeingDebugged = true;
      return await resultPromise;
    } finally {
      isBeingDebugged = false;
      repl.close();
      teardown();
    }
  };
}
