import {serverConfig}  from './server-config';
import {resolve} from './utils'
import {render} from 'ejs'
import {readFileSync, writeFileSync} from 'fs'
import {minify} from 'html-minifier';
import * as mkdirp from 'mkdirp'
import * as log from './log';
import {AppRequest, AppResponse, Map} from './types'

const minificationOptions = {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  decodeEntities: true,
  html5: true,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true,
  removeComments: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
};

export function minifyResponse(res, name: string, data, cachePath?: string) {
  const content = readFileSync('templates/' + name + '.ejs', 'utf8');
  let html = minify(render(content, data, {
    filename: __dirname + '/../../templates/' + name,
  }), minificationOptions);
  if (cachePath) {
    mkdirp(cachePath.substr(0, cachePath.lastIndexOf('/')), err => {
      writeFileSync(cachePath, html, 'utf8');
      res.send(html);
    });
  } else {
    res.send(html);
  }
}

export function SERVE(req: AppRequest, res: AppResponse, next) {
  res.serve = (name: string, options={}) => {
    const config = req.serverConfig || serverConfig;
    const data = {...config, ...options};
    minifyResponse(res, name, data);
  }
  next();
}

export function RESOLVE(req: AppRequest, res: AppResponse, next) {
  res.resolve = (error, value) => {
    resolve(error, res, value);
  }
  next();
}

export function ADMIN_LOGIN(req: AppRequest, res: AppResponse, next) {
  if (!req.user) {
    res.redirect('/admin/login');
  } else {
    next();
  }
}

export function ADMIN_SESSION(req: AppRequest, res: AppResponse, next) {
  if (req.adminSession && req.adminSession.user) {
    req.userTable.findOne({ username: req.adminSession.user.username },
      (err, user) => {
        if (user) {
          req.user = user;
          delete req.user.password;
          req.adminSession.user = user;
          res.locals.user = user;
        }
        next();
    });
  } else {
    next();
  }
}

export function CACHE(req: AppRequest, res: AppResponse, next) {
  res.cache = (name: string, options:Map = {}) => {
    const config = req.serverConfig || serverConfig;
    const data = {...config, ...options};
    if (data.cache !== undefined && !data.cache) {
      minifyResponse(res, name, data);
      return;
    }
    const cachePath = 'data/cache' + req.basePath + req.url + '.html';
    res.sendFile(cachePath, {root: './'}, err => {
      if (err) {  // No cached page
        log.warn('no cache for %s', cachePath);
        minifyResponse(res, name, data, cachePath);
      } else {
        log.info('Serving from cache data; %s', cachePath);
      }
    });
  }
  next();
}

export function handlerDecorator(
  target: Object,
  key: string,
  descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const req = args[0];
        const res = args[1];
        try {
          const response = originalMethod.apply(this, args);
          if (response && typeof response.catch === 'function') {
            response.catch(error => {
              log.error(error);
              req.errorFunction(res, 500, req.serverErrorMessage);
            });
          }
          return response;
        } catch(error) {
          log.error(error);
          req.errorFunction(res, 500, req.serverErrorMessage);
        }
        return;
    };
    return descriptor;
}

/*
export function handlerDecorator(handler) {
  return function(req: AppRequest, res: AppResponse) {
    try {
      const response = handler(req, res);
      if (response && typeof response.catch === 'function') {
        response.catch(error => {
          log.error(error);
          req.errorFunction(res, 500, req.serverErrorMessage);
        });
      }
    } catch(error) {
      log.error(error);
      req.errorFunction(res, 500, req.serverErrorMessage);
    }
  }
}
*/
