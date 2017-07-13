// @flow
import fs from 'fs';
import path from 'path';

import Output from 'utils/Output';

type WriteCacheFunc = (content: any) => void;
type PopulateCacheFunc = (...args: Array<*>) => Promise<*>;


function hash(value: string) {
  let hash = 0;

  if (value.length === 0) return hash;

  for (let i = 0; i < value.length; i++) {
    let char = value.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    // Convert to 32bit integer
    hash = hash & hash;
  }

  return hash;
}

function argsFilename(args: Array<*>) {
  const sanitizedArgs = args.map(arg => {
    if (typeof arg === 'string') return arg.replace(/(\/)/g, '-');

    if (typeof arg === 'object') return hash(JSON.stringify(arg))

    return arg;
  });

  return sanitizedArgs.join('--');
}

function buildWriter(filepath: string): WriteCacheFunc {
  return content => {
    fs.writeFileSync(filepath, JSON.stringify(content));
  };
}

class FileCache {
  _path: string;
  _populateCache: PopulateCacheFunc;

  writeCache: (path: string) => WriteCacheFunc;

  constructor(path: string, populateCache: PopulateCacheFunc) {
    this._path = path;
    this._populateCache = populateCache;
  }

  path(key: string): string {
    return path.join(this._path, `${key}.json`);
  }

  get(...args: Array<*>): Promise<*> {
    const key = argsFilename(args);
    const path = this.path(key);

    if (fs.existsSync(path)) {
      Output.debug('cache hit', key);

      // $FlowFixMe
      return Promise.resolve(require(path));
    }

    return this.update(...args);
  }

  update(...args: Array<*>): Promise<*> {
    const key = argsFilename(args);
    const path = this.path(key);

    Output.debug('cache update', key);

    // populate cache
    const write = buildWriter(path);
    return (
      this._populateCache(...args)
      .then(data => {
        write(data);
        return data;
      })
    );
  }
}

export default FileCache;
