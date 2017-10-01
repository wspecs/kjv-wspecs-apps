import * as mg from 'mongoose';
import {config} from './config'

let database = mg;
database.Promise = global.Promise;

/**
 * Local constiables.
 */
const host = `127.0.0.1:27017/${config.col}`;

let url = `mongodb://${host}`;
if (config.col && config.col_auth) {
  url = `mongodb://${config.col}:${config.col_auth}@${host}`;
}
if (config.col) {
  database.connect(url);
}

export const mongoose = mg;
