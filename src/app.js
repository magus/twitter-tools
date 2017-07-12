// @flow
import fs from 'fs';
import Twit from 'twit';
import ora from 'ora';

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

function output(...args) {
  const symbol = '  ';
  const stringifiedArgs = args.map(arg => {
    if (typeof(arg) !== 'object') return arg;

    return JSON.stringify(arg, null, 2);
  });

  const text = stringifiedArgs.join(' ');
  spinner.stopAndPersist({ symbol, text });
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

function call(endpoint, params) {
  spinner.start(endpoint);

  setTimeout(() => {
    spinner.succeed();
  }, 2000);

  return Promise.resolve();
  // return (
  //   T.get(endpoint, params)
  //     .then(({ resp, data }) => {
  //       output('resp', resp);
  //       output('data', data);
  //
  //       spinner.succeed();
  //
  //       return data;
  //     })
  // );
}

call('friends/list', { count: 1 }).then(data => {
  output('call output', data);
});
