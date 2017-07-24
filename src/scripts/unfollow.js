// @flow
import State from 'store/state';
import Cache from 'store/cache';

import getUsers from 'api/getUsers';

import User from 'models/User';

import friends from 'api/friends';
import followers from 'api/followers';

import promptKey from 'utils/promptKey';
import keyMirror from 'utils/keyMirror';
import Output from 'utils/Output';

type ModesType = {
  [modeName: string]: string,
};
const MODES: ModesType = keyMirror({
  BINARY_SEARCH: true,
  ONE_BY_ONE: true,
});

type BinarySearch = {
  low: number,
  high: number,
};

type PromptBinary = {
  mode?: string,
  search?: BinarySearch,
};

function promptUnfollow(user) {
  return promptKey(`🤔  ${user.out()} [y/n/(b)inary unfollow]`, key => /^y|n|b$/i.test(key)).then(key => {
    if (key === 'b') {
      return Promise.resolve(MODES.BINARY_SEARCH);
    }

    if (key === 'n') return;

    return user.unfollow().then(() => {
      Output.error(`Unfollowed ${user.out()}`);
    });
  });
}

function promptUnfollowBinary(users, search: BinarySearch): Promise<PromptBinary> {
  let { low, high } = search;
  let middle = Math.floor((low + high) / 2);
  let user = users[middle];

  Output.debug(user.out());

  return promptKey(`🤔  ${user.out()} [y/n/(o)ne by one]`, key => /^y|n|o$/i.test(key)).then(key => {
    if (key === 'o') {
      return { mode: MODES.ONE_BY_ONE };
    }

    if (key === 'y') {
      low = middle + 1;
    } else if (key === 'n') {
      high = middle - 1;
    } else {
      Output.error('Invalid key', key);
    }

    return { search: { low, high } };
  });
}

//////////////////////////////////////////////////
//                      MAIN                    //
//////////////////////////////////////////////////

// Get all friends
friends().then(followers).then(() => {
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

  let mode = MODES.ONE_BY_ONE;
  let index = 0;
  let search: BinarySearch = { low: -1, high: -1 };
  let waiting = false;

  function resetSearch() {
    // reset binary search state
    search = { low: -1, high: -1 };
  }

  let interval = setInterval(() => {
    if (!notFollowingBack[index]) return clearInterval(interval);

    // lock
    if (waiting) {
      // Output.debug('locked.');
      return;
    }

    Output.debug('locking...');
    waiting = true;

    Output.debug('mode', mode);

    if (mode === MODES.BINARY_SEARCH) {
      if (search.low === -1 || search.high === -1) {
        Output.info('Initiating binary search for unfollow group...');
        search.low = index;
        search.high = notFollowingBack.length;
      }

      if (search.high < search.low) {
        let unfollowCount = search.high - index;
        Output.success('Finished.');

        if (unfollowCount < 1) {
          Output.error('No users selected, resetting binary search');
          resetSearch();

          // unlock
          waiting = false;
          return;
        }

        Output.info(unfollowCount, 'users in unfollow group');
        Output.info('[START]', notFollowingBack[index].out());
        Output.info('[END]  ', notFollowingBack[search.high].out());
        promptKey(`🤔  Does this look correct? [y/n]`, key => /^y|n$/i.test(key)).then(key => {
          if (key === 'y') {
            Output.info('Unfollowing', unfollowCount, 'users...');

            // start at index following binary search
            index = search.high + 1;

            Output.done('Unfollowed', unfollowCount, 'users');
          } else {
            Output.error('Resetting binary search...');
          }
        }).then(() => {
          resetSearch();

          // unlock
          waiting = false;
        });
      } else {
        promptUnfollowBinary(notFollowingBack, search).then(promptReturn => {
          if (promptReturn.mode === MODES.ONE_BY_ONE) {
            Output.info('Initiating one by one...');
            mode = MODES.ONE_BY_ONE;

            // unlock
            waiting = false;
            return;
          }

          Output.debug('promptReturn.search', promptReturn.search);
          if (promptReturn.search) {
            search.low = promptReturn.search.low;
            search.high = promptReturn.search.high;
          }

          // unlock
          waiting = false;
        });
      }
    } else if (mode === MODES.ONE_BY_ONE) {
      // Prompt for unfollow make it very easy
      promptUnfollow(notFollowingBack[index]).then(newMode => {
        if (newMode === MODES.BINARY_SEARCH) {
          mode = MODES.BINARY_SEARCH;

          // unlock
          waiting = false;
          return;
        }

        // next user
        Output.debug('next user');
        index++;

        // unlock
        waiting = false;
      });
    } else {
      Output.error('Unknown mode', mode);
    }
  }, 16);
});
