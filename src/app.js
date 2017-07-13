// @flow
import fs from 'fs';
import path from 'path';
import Twit from 'twit';

import FileCache from 'utils/FileCache';
import Output from 'utils/Output';

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


const STATE = {
  followers: [],
};


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
  Output.start(endpoint, params);

  return (
    T.get(endpoint, params)
    .then(({ resp, data }) => {
      if (resp.statusCode !== 200) {
        Output.error(resp.statusCode, endpoint, params);
        Output.debug('resp', resp);
        Output.debug('data', data);
      }

      Output.done();

      return data;
    })
  );
}

debugger;

Output.error('test', 56, 'yes', false);

cache.check('friends/list', { count: 1 }).then(data => {
  Output.debug('call output', data);
});
