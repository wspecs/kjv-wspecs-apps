/**
* @module
*/
import * as minimist from 'minimist';


export const options = minimist(process.argv.slice(2));
export const command = process.argv[2];
export const operation = process.argv[3];

/**
 * Get command line flag value
 * @example
 * // return sample.md
 * // > nodemodule.js --filename sample.md
 * // OR
 * // > nodemodule.js -f sample.md
 * get('filename', 'f');
 * @param {string} longName - full name for the flag
 * @param {string} shortName - short name for the flga
 * @return {string} flag value
 */
export function get(longName: string, shortName?: string) {
  return options[shortName] || options[longName];
}

/**
 * Check if flag is specify
 * @example
 * // return true
 * // > nodemodule.js --filename sample.md -d ./
 * hasKey('filename');
 * // return false
 * hasKey('directory');
 * @param {string} key - flag name
 * @return {boolean} - true when flag is found.
 */
export function hasKey(key: string) {
  return get(key) !== undefined;
}

/**
 * Get value for flags directory (or -d).
 * @return {string} - value for directory flag
 */
export function getDirectory() {
  return get('directory', 'd') || '.';
}

/**
 * Check if module is running in debug mode
 * @return {boolean} true when module is running in debug mode
 */
export function debugMode() {
  const devMode = ['init', 'dev', 'debug', 'map', 'data'].some(function(x) {
    return process.argv[2] === x;
  });
  return devMode || hasKey('debug');
}

/**
 * Set defaul flag value
 * @param {string} key - flag to set
 * @param {boolean|string|undefined} [value=true] - flag's value
 * @return {void}
 */
export function setDefault(key: string, value?: string|boolean|number) {
  value = value || value === undefined;
  let flag = `--${key}=${value}`;
  if (typeof value === 'boolean') {
    flag = `--${value ? '' : 'no'}${key}`;
  }
  process.argv[process.argv.length] = flag;
  reload();
}

/**
 * Reload all the args.
 * @return {void}
 */
export function reload() {
  let options = minimist(process.argv.slice(2));
  module.exports.options = options;
  module.exports.command = process.argv[2];
  module.exports.operation = process.argv[3];
  for (let key in options) {
    if (options[key] === true && key.indexOf('no') === 0) {
      delete options[key];
      options[key.substr(2)] = false;
    }
  }
}
