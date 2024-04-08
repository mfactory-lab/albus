export type SimpleLogger = (...msg: any[]) => void

export type IFullLogger = {
  error: SimpleLogger
  warn: SimpleLogger
  log: SimpleLogger
}

export type Logger = SimpleLogger | IFullLogger

export function noopLogger() {}

export function toFullLogger(l: Logger): IFullLogger {
  if (typeof l === 'function') {
    return {
      error: (...m) => l(`ERROR:`, ...m),
      warn: (...m) => l(`WARNING:`, ...m),
      log: l,
    }
  } else {
    return l
  }
}
