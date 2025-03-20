/**
 * Pino Logger client class
 */
import pino from 'pino'

class ABCLogger {
  private static initted = false
  public static logger: pino.Logger

  constructor(logLevel?: string | null) {
    if (!ABCLogger.initted) {
      ABCLogger.initted = true
      if (logLevel == null) {
        logLevel = 'debug'
      }
      logger = pino({
        level: logLevel,

        browser: {
          asObject: true,
          write: {
            debug: function (msg: Record<string, any>) {
              const s = new Date(msg.time).toISOString()
              console.debug(`${s} : DEBUG : ${msg.msg}`)
            },
            info: function (msg: Record<string, any>) {
              const s = new Date(msg.time).toISOString()
              console.info(`${s} : INFO : ${msg.msg}`)
            },
            warning: function (msg: Record<string, any>) {
              const s = new Date(msg.time).toISOString()
              console.warn(`${s} : WARNING : ${msg.msg}`)
            },
            error: function (msg: Record<string, any>) {
              const s = new Date(msg.time).toISOString()
              console.error(`${s} : ERROR : ${msg.msg}`)
            }
          }
        }
      })
    }
    ABCLogger.logger = logger
  }
}

let logger: pino.Logger

export { ABCLogger, logger }
