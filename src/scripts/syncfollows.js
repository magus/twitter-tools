// @flow
import State from 'store/state';
import Cache from 'store/cache';

import getUsers from 'api/getUsers';

import User from 'models/User';

import friends from 'api/friends';

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

//////////////////////////////////////////////////
//                      MAIN                    //
//////////////////////////////////////////////////

// Get all friends
friends().then(() => {
  // Select list to sync
  // https://dev.twitter.com/rest/reference/get/lists/list
  return Cache.get('lists/list').then(data => {
    Output.info('data', data);

    return data;
  });
});
