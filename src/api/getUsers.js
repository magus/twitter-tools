// @flow
import State from 'store/state';
import Cache from 'store/cache';
import Output from 'utils/Output';

const USERS_LOOKUP_MAX = 100;

// Get users in batches
// https://dev.twitter.com/rest/reference/get/users/lookup
export default function getUsers(ids: Array<number>, index?: number = 0, chunk?: number = USERS_LOOKUP_MAX) {
  const remaining = ids.length - index;

  if (remaining === 0) return Output.info('getUsers retrieved all', ids.length, 'ids');

  const count = remaining > USERS_LOOKUP_MAX ? USERS_LOOKUP_MAX : remaining;
  const nextIndex = index + count;

  Output.info('ids', `[${index}:${nextIndex}]`);

  const selectedIds = ids.slice(index, nextIndex);

  const user_id = selectedIds.join(',');
  return Cache.get('users/lookup', { user_id }).then(users => {
    Output.debug(users.length, 'users returned by getUsers');
    users.forEach(user => {
      // Add to users map
      State.users[user.id] = user;
    });

    // next call
    return getUsers(ids, nextIndex);
  });
}
