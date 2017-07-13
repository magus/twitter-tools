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

// Persist state to JSON on disk
// Read in state from JSON on disk
// Only update followers when explicitly told to update

// Get all friends
// https://dev.twitter.com/rest/reference/get/friends/ids

// Get users in 100 batches
// https://dev.twitter.com/rest/reference/get/users/lookup



const cache = new FileCache(`${__dirname}/../cache`, (write, ...args) => {
  return (
    Twitter.get(...args)
    .then(data => {
      write(data);
      return data;
    })
  );
});


debugger;

cache.get('friends/list', { count: 1 }).then(data => {
  Output.debug('call output', data);
});
