import type {Logger} from './types';

export function extendContext(
  context: Record<string, unknown>,
  extensionMap: Map<string, () => unknown>,
  logger: Logger
) {
  const descriptors = new Map<string, PropertyDescriptor>();
  const existingKeys: string[] = [];

  for (const [key, get] of extensionMap) {
    if (key in context) {
      existingKeys.push(key);
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
  if (existingKeys.length > 0) {
    logger.warn(
      'The following properties already exist in the context object ' +
      'and will not be available for debugging: ',
      existingKeys
    );
  }
  Object.defineProperties(context, Object.fromEntries([...descriptors]));

  return () => {
    for (const [key, {get}] of descriptors) {
      // Remove property only if it was not changed.
      if (get === Object.getOwnPropertyDescriptor(context, key)?.get) {
        delete context[key];
      }
    }
    descriptors.clear();
  };
}
