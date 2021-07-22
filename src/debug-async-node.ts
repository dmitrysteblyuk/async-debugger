import {start as startRepl, ReplOptions} from 'repl';
import {createDebuggerAPI} from './create-debugger-api';
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
    const {resultPromise, applyToContexts, api} = (
      createDebuggerAPI(bindings, apiNamespace, logger)
    );
    const repl = startRepl(replOptions);
    repl.once('exit', api.resumeExecution);
    const teardown = applyToContexts([...contexts, repl.context]);

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
