// @flow
import State from 'store/state';
import Cache from 'store/cache';

import getUsers from 'api/getUsers';

import User from 'models/User';

import friends from 'scripts/friends';

import promptKey from 'utils/promptKey';
import Output from 'utils/Output';

function promptUnfollow(user) {
  return promptKey(`🤔  ${user.out()} [y/n]`, key => /^y|n$/i.test(key)).then(key => {
    if (key !== 'y') return;

    return user.unfollow().then(() => {
      Output.error(`Unfollowed ${user.out()}`);
    });
  });
}

export default function() {
  // Get all friends
  friends().then(() => {
    // Get all followers and store in state
    // https://dev.twitter.com/rest/reference/get/followers/ids
    return Cache.get('followers/ids', { count: 5000 }).then(({ ids }) => {
      Output.info(ids.length, 'followers returned');

      // Store as a simple `user_id: true` map which will allow fast 'followed_by' lookups
      return getUsers(ids, 'followers');
    });
  }).then(() => {
    // Do stuff with user objects
    Output.out();
    Output.info('State.following', State.following.length);
    Output.info('State.users', Object.keys(State.users).length);
    Output.info('State.followers', Object.keys(State.followers).length);

    const notFollowingBack = [];
    State.following.forEach(id => {
      if (!State.users[id]) return Output.debug(id, 'user not in state');

      const user = new User(State.users[id]);
      if (!user.doesFollowBack()) notFollowingBack.push(user);
    });

    Output.out();
    Output.warn(notFollowingBack.length, 'users not following back');
    Output.info('Choose their fate!');
    Output.out();

    let index = 0;
    let waiting = false;
    let interval = setInterval(() => {
      if (!notFollowingBack[index]) return clearInterval(interval);

      // lock
      if (waiting) {
        // Output.debug('locked.');
        return;
      }

      Output.debug('locking...');
      waiting = true;

      // Prompt for unfollow make it very easy
      promptUnfollow(notFollowingBack[index]).then(() => {
        Output.debug('next user');

        // next user
        index++;
        waiting = false;
      });
    }, 16);
  });
}
