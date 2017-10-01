const moment = require('moment');


/**
 * Get timestamp.
 * @param {string} dateFormat - desired output format.
 * @return {string} - A UTC timestamp for now.
 */
export function time(dateFormat?: string) {
  if (dateFormat) {
    return moment(moment().utc()).toString();
  }
  return moment.now();
};


/**
 * Get time elapsed from now.
 * @param {string} dateString - a timestamp or date formatted string.
 * @return {string} - human readable time elapsed
 */
export function fromNow(date: string) {
  return moment(date).fromNow();
};


/**
 * Get difference between a past date and now.
 * @param {string} dateString - a timestamp or date formatted string.
 * @return {number} - the different from now for the given date in
 * milliseconds
 */
export function difference(date: string) {
  return moment(moment().utc()).diff(moment(date));
};
