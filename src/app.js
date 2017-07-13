// @flow
import fs from 'fs';
import path from 'path';
import Twit from 'twit';

import Twitter from 'api/Twitter';
import FileCache from 'utils/FileCache';
import Output from 'utils/Output';

type UserMap = { [id: number]: any };
type State = {
  users: UserMap,
};

const STATE: State = {
  users: {},
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

const USERS_LOOKUP_MAX = 100;

function getUsers(ids: Array<number>, index?: number = 0) {
  const remaining = ids.length - index;

  if (remaining === 0) return Output.info('getUsers retrieved all', ids.length, 'ids');

  const count = remaining > USERS_LOOKUP_MAX ? USERS_LOOKUP_MAX : remaining;
  const nextIndex = index + count;

  Output.info('ids', `[${index}:${nextIndex}]`);

  const selectedIds = ids.slice(index, nextIndex);

  const user_id = selectedIds.join(',');
  return cache.get('users/lookup', { user_id }).then(users => {
    Output.debug(users.length, 'users returned by getUsers');
    users.forEach(user => {
      // Add to users map
      STATE.users[user.id] = user;
    });

    // next call
    return getUsers(ids, nextIndex);
  });
}

cache.get('friends/ids', { count: 5000 }).then(({ ids }) => {
  Output.info(ids.length, 'ids returned');
  return getUsers(ids);
}).then(() => {
  Output.info('STATE.users', Object.keys(STATE.users).length);
});
