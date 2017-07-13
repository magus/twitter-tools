// @flow
import State from 'store/state';
import Cache from 'store/cache';

import getUsers from 'api/getUsers';

import Output from 'utils/Output';


function outputUser(user) {
  return `@${user.screen_name} (${user.name})`;
}

function outputFriendship(friendship) {
  const follows = ~friendship.connections.indexOf('followed_by') ? '[FOLLOWS] ' : '';
  return `${outputUser(friendship)} ${follows}`;
}

//////////////////////////////////////////////////
//                      MAIN                    //
//////////////////////////////////////////////////

debugger;

// Get all friends
// https://dev.twitter.com/rest/reference/get/friends/ids
Cache.get('friends/ids', { count: 5000 }).then(({ ids }) => {
  Output.info(ids.length, 'ids returned');

  State.following = [].concat(ids);

  // Use ids to lookup user entities
  return getUsers(ids, 'users');
}).then(() => {
  // Get all followers and store in state
  // https://dev.twitter.com/rest/reference/get/followers/ids
  return Cache.get('followers/ids', { count: 5000 }).then(({ ids }) => {
    Output.info(ids.length, 'ids returned');

    // Store as a simple `user_id: true` map which will allow fast 'followed_by' lookups
    return getUsers(ids, 'followers');
  });
}).then(() => {
  // Do stuff with user objects
  Output.info('State.following', Object.keys(State.following).length);
  Output.info('State.users', Object.keys(State.users).length);
  Output.info('State.followers', Object.keys(State.followers).length);


});
