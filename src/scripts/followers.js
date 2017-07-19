// @flow
import State from 'store/state';
import Cache from 'store/cache';

import getUsers from 'api/getUsers';

import Output from 'utils/Output';

export default function() {
  // Get all followers and store in state
  // https://dev.twitter.com/rest/reference/get/followers/ids
  return Cache.get('followers/ids', { count: 5000 }).then(({ ids }) => {
    Output.info(ids.length, 'followers returned');

    // Store as a simple `user_id: true` map which will allow fast 'followed_by' lookups
    return getUsers(ids, 'followers');
  });
}
