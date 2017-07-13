// @flow
import fs from 'fs';
import path from 'path';
import Twit from 'twit';

import Twitter from 'api/Twitter';
import FileCache from 'utils/FileCache';
import Output from 'utils/Output';


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

// Get all friends
// https://dev.twitter.com/rest/reference/get/friends/ids

// Get users in 100 batches
// https://dev.twitter.com/rest/reference/get/users/lookup


const cache = new FileCache(`${__dirname}/../cache`, Twitter.get);

debugger;

function getUsers(ids) {
  const user_id = ids.join(',');
  cache.get('users/lookup', { user_id, count: 100 }).then(users => {
    Output.debug(users.length, 'users returned by getUsers');
  });
}

cache.get('friends/ids', { count: 5000 }).then(({ ids }) => {
  Output.debug(ids.length, 'ids returned');

  getUsers(ids.slice(0, 50))
});
