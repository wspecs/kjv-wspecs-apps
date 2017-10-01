import {options} from './args'
import {Map} from './types'
import {warn} from './log'
import {readFileSync} from 'fs'

const configPath = __dirname + '/../../config.json';
const authPath = (process.env.HOME || process.env.USERPROFILE) + '/.wsconfig';

export function getConfig() {
  let config: Map;
  try {
    // Attemp to read localconfig first
    config = JSON.parse(readFileSync('config.json', 'utf8'));
  }
  catch (e) {
    // Fallback to ws-lib default config
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  }

  try {
    // Attempts to read config file.
    const content = readFileSync(config.wsConfigPath || authPath, 'utf8');
    content.split('\n').forEach(function(line) {
      const entry = line.split(' ');
      if (entry.length === 2) {
        config[entry[0].replace(':', '')] = entry[1];
      }
    });
    config.col_auth = config['api_scope_' + config.col];
  }
  catch (e) {
    warn('Could not read wsconfig');
  }
  config.version = (new Date()).getTime();
  return {...config, ...options};
}

export const config = getConfig();
