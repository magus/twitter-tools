// @flow
import State from 'store/state';
import Cache from 'store/cache';

import getUsers from 'api/getUsers';

import User from 'models/User';

import Output from 'utils/Output';


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
  Output.info('State.following', State.following.length);
  Output.info('State.users', Object.keys(State.users).length);
  Output.info('State.followers', Object.keys(State.followers).length);

  const notFollowingBack = [];
  State.following.forEach(id => {
    if (!State.users[id]) return Output.debug(id, 'user not in state');

    const user = new User(State.users[id]);
    if (!user.doesFollowBack()) notFollowingBack.push(user);
  });

  Output.info(notFollowingBack.length, 'users not following back');

  let index = 0;
  setInterval(() => {
    const user = notFollowingBack[index];

    // Prompt for unfollow make it very easy
    Output.info(user.out());

    // next user
    index++;
  }, 1000)


});
