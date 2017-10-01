import {Map} from './types'
import {debugMode} from './args';
import * as chalk from 'chalk'

const INFO = chalk.white;
const DATA = chalk.cyan;
const ERROR = chalk.magenta;
const WARN = chalk.yellow;

/**
 * Generic function to write to the console
 * @param {Array<Object>} texts - argument for logging
 * @param {!Function} writer - chalk writer
 * @param {string} context - log category (e.g INFO, ERROR)
 * @param {string} line - additional text to log.
 * @return {void}
 */
export function write(texts, writer, context?: string, line?: string) {
  if (typeof texts[0] === 'object' || Array.isArray(texts[0])) {
    data(texts[0]);
    return;
  }
  line = line || writer(texts[0]);
  context = `[${(new Date()).toString()}] ` + (context || '');
  let index = 1;
  for (;index < texts.length; index++) {
    if (line.indexOf('%s') === -1) {
      break;
    }
    line = line.replace('%s', writer.bold(texts[index]));
  }
  console.log(context + writer(line));
  for (;index < texts.length; index++) {
    console.log(context + writer(texts[index]));
  }
}

/**
 * Handles all default logs.
 * @return {void}
 */

export function print(...args: Array<string|number>) {
  write(args, INFO);
}

/**
 * Prepend INFO to logs
 * @return {void}
 */
export function info(...args: Array<string|number>) {
  write(args, INFO, chalk.green('INFO: '));
};


/**
 * Handles all warning logs.
 */
export function warn(...args: Array<string|number>) {
  write(args, WARN, chalk.yellow('WARNING: '));
};


export function data(...args: (Array<Map|any[]>)) {
  for (let index = 0; index < arguments.length; index++) {
    console.log(DATA(JSON.stringify(arguments[index], null, 2)));
  }
}

export function error(...args: Array<string|number>) {
  write(arguments, ERROR, chalk.red('ERROR: '));
};


/**
 * Handles all debugging logs--only print in development mode.
 */
export function debug() {
  if (debugMode()) {
    write(arguments, INFO, chalk.magenta('DEBUG: '));
  }
};
