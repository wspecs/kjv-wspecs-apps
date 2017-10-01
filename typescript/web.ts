"use strict";

import * as express from "express";
import {routes} from './routes';
import {info} from './lib/log';
import {configureRest} from './lib/rest-config';
import {serverConfig} from './lib/server-config';

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();
    configureRest(this.app, express);
  }

  routeApp() {
    this.app.use(routes);
  }

  start() {
    this.routeApp();
    this.app.listen(serverConfig.port, function () {
      info('port: %s', serverConfig.port);
      info('url: %s', serverConfig.base);
    });
  }
}
