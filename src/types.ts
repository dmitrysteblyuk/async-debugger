export interface Bindings {
  [variableName: string]: () => unknown;
}
export interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
}
export interface DebugAsyncCommonOptions {
  contexts?: object[];
  logger?: Partial<Logger>;
  apiNamespace?: string;
}
