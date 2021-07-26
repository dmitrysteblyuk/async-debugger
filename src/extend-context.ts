import type {Logger} from './core';
import {logKeys} from './utils';

export function extendContext(
  context: Record<string, unknown>,
  extension: Map<string, () => unknown>,
  overrideProperties: boolean,
  logger: Logger,
) {
  const descriptors = new Map<string, PropertyDescriptor>();
  const skippedKeys: string[] = [];
  const previousDescriptors = new Map<string, PropertyDescriptor>();

  for (const [key, get] of extension) {
    let shouldSkip = overrideProperties
      ? context.hasOwnProperty(key)
      : key in context;
    if (shouldSkip && overrideProperties) {
      const descriptor = Object.getOwnPropertyDescriptor(context, key);
      if (descriptor?.configurable) {
        previousDescriptors.set(key, descriptor);
        shouldSkip = false;
      }
    }
    if (shouldSkip) {
      skippedKeys.push(key);
      continue;
    }
    descriptors.set(key, {
      get,
      set(value) {
        delete context[key];
        context[key] = value;
      },
      configurable: true,
      enumerable: true,
    });
  }
  for (const [key, descriptor] of descriptors) {
    Object.defineProperty(context, key, descriptor);
  }
  if (skippedKeys.length > 0) {
    logger.warn?.(
      'The following context properties ' +
        (overrideProperties ? 'are not configurable' : 'already exist') +
        ` and has NOT been overriden: ${logKeys(skippedKeys)}.`,
    );
  }
  if (previousDescriptors.size > 0) {
    logger.warn?.(
      `The following context properties has been overriden: ${logKeys(
        previousDescriptors.keys(),
      )}.`,
    );
  }

  return () => {
    const unrestoredKeys: string[] = [];
    for (const [key, {get}] of descriptors) {
      // Restore or delete property only if it was not changed.
      if (get !== Object.getOwnPropertyDescriptor(context, key)?.get) {
        if (previousDescriptors.has(key)) {
          unrestoredKeys.push(key);
        }
        continue;
      }
      if (previousDescriptors.has(key)) {
        Object.defineProperty(context, key, previousDescriptors.get(key)!);
      } else {
        delete context[key];
      }
    }
    descriptors.clear();
    previousDescriptors.clear();

    if (unrestoredKeys.length > 0) {
      logger.warn?.(
        'The following context properties has not been restored because ' +
          `they were changed during debugging: ${logKeys(unrestoredKeys)}.`,
      );
    }
  };
}
