// @flow
import State from 'store/state';
import Cache from 'store/cache';
import Output from 'utils/Output';

const USERS_LOOKUP_MAX = 100;

// Get users in batches
// https://dev.twitter.com/rest/reference/get/users/lookup
export function getUsers(ids: Array<number>, stateKey?: string): Promise<*> {
  Output.start('Retrieving users...');

  const promises = [];

  let index = 0;
  while ((ids.length - index) > 0) {
    const remaining = ids.length - index;
    const count = remaining > USERS_LOOKUP_MAX ? USERS_LOOKUP_MAX : remaining;
    const nextIndex = index + count;

    Output.start('ids', `[${index}:${nextIndex}]`);
    const selectedIds = ids.slice(index, nextIndex);

    const user_id = selectedIds.join(',');

    promises.push(
      Cache.get('users/lookup', { user_id }).then(users => {
        Output.debug(users.length, 'users returned by getUsers');

        // Add to State if specified
        if (stateKey) {
          const state = State[stateKey];
          users.forEach(user => {
            state[user.id] = user;
          });
        }

        return users;
      })
    );

    // update index
    index = nextIndex;
  }

  Output.debug('promises', promises.length);
  return Promise.all(promises).then(results => {
    // join results into single array
    let allUsers = [];
    results.forEach(usersResult => {
      allUsers = allUsers.concat(usersResult);
    });

    return allUsers;
  });
}

// Get users in batches returning a promise
export default function _getUsers(ids: Array<number>, stateKey?: string, index?: number = 0, chunk?: number = USERS_LOOKUP_MAX): Promise<*> {
  Output.start('Retrieving users...');

  return getUsers(ids, stateKey).then(results => {
    Output.debug('getUsers retrieved all', ids.length, 'ids');
    return results;
  });
}
