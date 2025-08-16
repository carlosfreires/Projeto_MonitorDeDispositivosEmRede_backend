// utils/logger/Logger.js
const chalk = require('chalk');

/**
 * Logger simples e centralizado.
 * Métodos: info, warn, error, debug, success
 * Mantém padrão de prefixos e facilita leitura dos logs.
 */
class Logger {
  _prefix(level) {
    return {
      info: chalk.cyan('[INFO]'),
      warn: chalk.yellow('[WARN]'),
      error: chalk.red('[ERROR]'),
      debug: chalk.gray('[DEBUG]'),
      success: chalk.green('[OK]')
    }[level] || chalk.white('[LOG]');
  }

  info(...args) {
    console.info(this._prefix('info'), ...args);
  }

  warn(...args) {
    console.warn(this._prefix('warn'), ...args);
  }

  error(...args) {
    console.error(this._prefix('error'), ...args);
  }

  debug(...args) {
    // Use debug para informações verbosas / SQL / payloads grandes
    console.debug(this._prefix('debug'), ...args);
  }

  success(...args) {
    console.log(this._prefix('success'), ...args);
  }
}

module.exports = new Logger();