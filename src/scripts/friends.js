// @flow
import State from 'store/state';
import Cache from 'store/cache';

import getUsers from 'api/getUsers';

import Output from 'utils/Output';

export default function() {
  // Get all friends
  // https://dev.twitter.com/rest/reference/get/friends/ids
  return Cache.get('friends/ids', { count: 5000 }).then(({ ids }) => {
    Output.info(ids.length, 'friends returned');

    State.following = [].concat(ids);

    // Use ids to lookup user entities
    return getUsers(ids, 'users');
  });
}
