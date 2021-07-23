export const API_NAMESPACE = 'AsyncDebugger';

export function getLogger(
  {
    info = console.info.bind(console, `[${API_NAMESPACE}]`),
    warn = console.warn.bind(console, `[${API_NAMESPACE}]`),
    error = console.error.bind(console, `[${API_NAMESPACE}]`)
  }: Partial<Logger> = {}
) {
  return {info, warn, error};
}

export interface Bindings {
  [variableName: string]: () => unknown;
}
export interface Logger {
  info: ((...args: unknown[]) => void) | null;
  warn: ((...args: unknown[]) => void) | null;
  error: ((...args: unknown[]) => void) | null;
}
export interface DebugAsyncCommonOptions {
  contexts?: object[];
  logger?: Partial<Logger>;
  apiNamespace?: string;
  overrideProperties?: boolean;
}
