import {Request, Response} from 'express';

export interface AppRequest extends Request {
  adminSession?: {
    user: any;
  };
  basePath?: string;
  errorFunction?: (req: AppResponse, code: number, message: string) => void;
  user: any;
  serverErrorMessage?: string;
  serverConfig: ServerConfig;
  userTable?: any;
}

export interface AppResponse extends Response {
  cache: (name: string, options: Map) => (void | Promise<void>);
  resolve: (error: Error, value: Generic) => (void | Promise<void>);
  serve: (name: string, options: Map) => (void | Promise<void>);
}

export interface Config extends Map {}

export type Generic = string|number|null|boolean|Map;

export interface Map {
  [key: string]: any;
}

export interface ServerConfig extends Config {}
