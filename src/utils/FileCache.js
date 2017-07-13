// @flow
import fs from 'fs';
import path from 'path';

import Output from 'utils/Output';

type WriteCacheFunc = (content: any) => void;
type PopulateCacheFunc = (write: WriteCacheFunc, ...args: Array<*>) => Promise<*>;

class FileCache {
  _path: string;
  _populateCache: PopulateCacheFunc;

  writeCache: (path: string) => WriteCacheFunc;

  constructor(path: string, populateCache: PopulateCacheFunc) {
    this._path = path;
    this._populateCache = populateCache;

    this.writeCache = path => content => {
      fs.writeFileSync(path, JSON.stringify(content));
    };
  }

  key(...args: Array<*>) {
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'string') return arg.replace(/\//g, '-');

      if (typeof arg === 'object') {
        return JSON.stringify(arg).replace(/(\{|\}|\"|\:)/g, '_')
      }

      return arg;
    });

    return sanitizedArgs.join('--');
  }

  path(key: string) {
    return path.join(this._path, `${key}.json`);
  }

  check(...args: Array<*>): Promise<*> {
    const key = this.key(...args);
    const path = this.path(key);

    if (fs.existsSync(path)) {
      Output.debug('cache hit', key);

      // $FlowFixMe
      return Promise.resolve(require(path));
    }

    Output.debug('no cache', key);

    // populate cache
    const write = this.writeCache(path);
    return this._populateCache(write, ...args);
  }
}

export default FileCache;
