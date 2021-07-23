import type {Logger} from './core';

export function extendContext(
  context: Record<string, unknown>,
  extension: Map<string, () => unknown>,
  overrideProperties: boolean,
  logger: Logger
) {
  const descriptors = new Map<string, PropertyDescriptor>();
  const skippedKeys: string[] = [];
  const previousDescriptors = new Map<string, PropertyDescriptor>();

  for (const [key, get] of extension) {
    let shouldSkip = (
      overrideProperties
        ? context.hasOwnProperty(key)
        : key in context
    );
    if (shouldSkip && overrideProperties) {
      const descriptor = Object.getOwnPropertyDescriptor(context, key);
      if (descriptor?.configurable) {
        previousDescriptors.set(key, descriptor);
        shouldSkip = false;
      }
    }
    if (shouldSkip) {
      skippedKeys.push(key);
    } else {
      descriptors.set(key, {
        get,
        set(value) {
          delete context[key];
          context[key] = value;
        },
        configurable: true,
        enumerable: true
      });
    }
  }
  if (skippedKeys.length > 0) {
    logger.warn?.(
      `The following properties ${
        overrideProperties ? 'are not configurable' : 'already exist'
      } in the context object ` +
      `and will NOT be overriden: [${skippedKeys.sort().join(', ')}].`
    );
  }
  if (previousDescriptors.size > 0) {
    logger.warn?.(
      `The following properties will be overriden: ` +
      `[${[...previousDescriptors.keys()].sort().join(', ')}].`
    );
  }
  Object.defineProperties(context, Object.fromEntries([...descriptors]));

  return () => {
    for (const [key, {get}] of descriptors) {
      // Remove property only if it was not changed and did not exist before.
      if (
        !previousDescriptors.has(key) &&
        get === Object.getOwnPropertyDescriptor(context, key)?.get
      ) {
        delete context[key];
      }
    }
    descriptors.clear();
    if (previousDescriptors.size === 0) {
      return;
    }
    Object.defineProperties(
      context,
      Object.fromEntries([...previousDescriptors])
    );
    previousDescriptors.clear();
  };
}
