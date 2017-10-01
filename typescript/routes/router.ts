import {Router} from 'express';
import {CACHE, RESOLVE, SERVE} from './../lib/router-config';
import * as Cookies from 'cookies';
import {AppRequest, AppResponse} from './../lib/types'


const PAGE_NOT_FOUND = 'Oops, the page you\'re looking for is missing.';
const SERVER_ERROR = 'Something went wrong!';

export class BasicRoutes {

  basePath = '';
  templatePath = '';
  errorMessage: string;
  router: Router;

  constructor(basePath, errorMessage404=PAGE_NOT_FOUND,
    serverErrorMessage=SERVER_ERROR) {
      this.basePath = basePath;
      this.errorMessage = errorMessage404;
      this.router = Router();
      this.router.use(RESOLVE);
      this.router.use(CACHE);
      this.router.use(SERVE);
      this.router.use((req: AppRequest, res, next) => {
        if (this.basePath) {
          req.basePath = '/' + this.basePath;
          this.templatePath = this.basePath + '/';
        }
        req.cookies = new Cookies(req, res);
        req.errorFunction = this.showError;
        req.serverErrorMessage = serverErrorMessage;
        next();
      });
  }

  private error404(req, res) {
    return this.showError(res, 404);
  }

  public showError(res, code=404, message=this.errorMessage) {
    const page = {error: {code, message}};
    res.status = code;
    res.cache(this.basePath + '/error', page);
  }

  public getCookie(req: AppRequest, name: string) {
    req.cookies.get(name);
  }

  public setCookie(req: AppRequest, name: string, value: string|number|boolean,
    options={}) {
    req.cookies.set(name, value, {
      httpOnly: true,
      path: '/' + this.basePath,
      ...options,
    });
  }

  public renderLayout(page, renderFn) {
    this.renderPage(this.templatePath + 'layout', page, renderFn);
  }

  public renderPage(path: string, page, renderFn) {
    renderFn(path, page);
  }

  public get() {
    this.router.get('*', this.error404.bind(this));
    return this.router;
  }
}
