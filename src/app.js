// @flow
import fs from 'fs';
import path from 'path';
import Twit from 'twit';
import ora from 'ora';

const DEBUG = true;
// Read in secrets from config/secrets.json
const SECRETS = require('../config/secrets.json');

const T = new Twit({
  consumer_key:         SECRETS.consumer_key,
  consumer_secret:      SECRETS.consumer_secret,
  access_token:         SECRETS.access_token,
  access_token_secret:  SECRETS.access_token_secret,

  // optional HTTP request timeout to apply to all requests.
  timeout_ms:           60*1000,
});

const spinner = ora().start('manage-following initialized...');
spinner.stopAndPersist({ symbol: '👾 ' });

const STATE = {
  followers: [],
};

function outputPersist(symbol = ' ', ...args) {
  symbol += ' ';

  const stringifiedArgs = args.map(arg => {
    if (typeof(arg) !== 'object') return arg;

    return JSON.stringify(arg, null, 2);
  });

  const text = stringifiedArgs.join(' ');
  spinner.stopAndPersist({ symbol, text });
}

function output(...args) {
  return outputPersist(...args);
}

function debug(...args) {
  if (!DEBUG) return;

  return output(...args);
}

function error(...args) {
  return outputPersist('❗️ ', ...args);
}

function outputUser(user) {
  return `@${user.screen_name} (${user.name})`;
}

function outputFriendship(friendship) {
  const follows = ~friendship.connections.indexOf('followed_by') ? '[FOLLOWS] ' : '';
  return `${outputUser(friendship)} ${follows}`;
}

// Get all followers and store in state
// https://dev.twitter.com/rest/reference/get/followers/ids

// Store as a simple `user_id: true` map which will allow fast 'followed_by' lookups

// Persist state to JSON on disk
// Read in state from JSON on disk
// Only update followers when explicitly told to update

// Get all friends
// https://dev.twitter.com/rest/reference/get/friends/ids

// Get users in 100 batches
// https://dev.twitter.com/rest/reference/get/users/lookup

function getFriendship(users) {
  const screen_name = users.map(user => user.screen_name).join(',');
  return (
    T.get('friendships/lookup', { screen_name })
    .then(({ data }) => data)
  );
}


type WriteCacheFunc = (content: any) => void;

class FileCache {
  _path: string;
  _populateCache: (write: WriteCacheFunc, ...args: Array<*>) => Promise<*>;

  writeCache: (path: string) => WriteCacheFunc;

  constructor(path, populateCache) {
    this._path = path;
    this._populateCache = populateCache;

    this.writeCache = path => content => {
      fs.writeFileSync(path, JSON.stringify(content));
    };
  }

  key(...args) {
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'string') return arg.replace(/\//g, '-');

      if (typeof arg === 'object') {
        return JSON.stringify(arg).replace(/(\{|\}|\"|\:)/g, '_')
      }

      return arg;
    });

    return sanitizedArgs.join('--');
  }

  path(key) {
    return path.join(this._path, `${key}.json`);
  }

  check(...args): Promise<*> {
    const key = this.key(...args);
    const path = this.path(key);

    if (fs.existsSync(path)) {
      debug('cache hit', key);

      // $FlowFixMe
      return Promise.resolve(require(path));
    }

    debug('no cache', key);

    // populate cache
    const write = this.writeCache(path);
    return this._populateCache(write, ...args);
  }
}

const cache = new FileCache(`${__dirname}/../cache`, (write, ...args) => {
  return (
    call(...args)
    .then(data => {
      write(data);
      return data;
    })
  );
});


function call(endpoint, params) {
  spinner.start(endpoint);

  return (
    T.get(endpoint, params)
    .then(({ resp, data }) => {
      if (resp.statusCode !== 200) {
        error(resp.statusCode, endpoint, params);
        debug('resp', resp);
        debug('data', data);
      }

      spinner.succeed();

      return data;
    })
  );
}

debugger;

cache.check('friends/list', { count: 1 }).then(data => {
  debug('call output', data);
});
