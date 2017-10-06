// @flow
import _chunk from 'lodash/chunk';
import State from 'store/state';
import Cache from 'store/cache';

import Twitter from 'api/Twitter';
import getUsers from 'api/getUsers';

import User from 'models/User';

import friends from 'api/friends';

import promptKey from 'utils/promptKey';
import Output from 'utils/Output';
import keyMirror from 'utils/keyMirror';
import random from 'utils/random';
import wait from 'utils/wait';


type ModesType = {
  [modeName: string]: string,
};
const MODES: ModesType = keyMirror({
  AUTO: true,
  ONE_BY_ONE: true,
});

//////////////////////////////////////////////////
//                      MAIN                    //
//////////////////////////////////////////////////

function promptUnfollow(user) {
  return promptKey(`🤔  ${user.out()} [y/n/(a)uto]`, key => /^y|n|a$/i.test(key)).then(key => {
    if (key === 'n') return;

    if (key === 'a') {
      return Promise.resolve(MODES.AUTO);
    }

    return user.unfollow().then(() => {
      Output.error(`Unfollowed ${user.out()}`);
    });
  });
}

// Get all friends
friends().then(() => {
  // Select list to sync
  // https://dev.twitter.com/rest/reference/get/lists/list
  return Cache.get('lists/list').then(lists => {
    Output.out();
    lists.forEach((list, i) => {
      Output.info(i, '\t', list.name);
    });
    Output.out();

    return lists;
  })
}).then(lists => {
  return promptKey(`🤔  which list? `, key => !!lists[key]).then(key => {
    const selectedList = lists[key];
    Output.debug('selectedList', selectedList.name);
    return selectedList;
  });
}).then(list => {
  // Get current members of list
  return Cache.get('lists/members', {
    owner_id: list.user.id,
    slug: list.slug,
    count: 5000,
  }).then(({ users }) => {
    return { list, users };
  });
}).then(({ list, users }) => {
  Output.debug('State.following', State.following.length);
  Output.debug('list', list.name, list.id);
  Output.debug('list members', users.length);

  const followingMap = {};
  State.following.forEach(userID => {
    followingMap[userID] = true;
  });
  Output.debug('followingMap', Object.keys(followingMap).length);

  const listMemberMap = {};
  users.forEach(user => {
    listMemberMap[user.id] = user;
  });
  Output.debug('listMemberMap', Object.keys(listMemberMap).length);

  // Iterate following and generate list of members we need to remove
  const idsToUnfollow = [];
  Object.keys(followingMap).forEach(userID => {
    if (listMemberMap[userID]) return;
    idsToUnfollow.push(+userID);
  });

  return getUsers(idsToUnfollow);
}).then(unfollowUsers => {
  // Output `Unfollowing X users...`
  Output.start(`Unfollowing ${unfollowUsers.length} friends...`);

  Output.out();
  Output.warn(unfollowUsers.length, 'users not following back');
  Output.info('Choose their fate!');
  Output.out();

  let mode = MODES.ONE_BY_ONE;
  let index = 0;
  let waiting = false;
  let interval = setInterval(() => {
    const user = new User(unfollowUsers[index]);

    if (!user) return clearInterval(interval);

    // lock
    if (waiting) {
      // Output.debug('locked.');
      return;
    }

    Output.debug('mode', mode);
    Output.debug('locking...');
    waiting = true;

    if (mode === MODES.AUTO) {
      Output.info('Automaticlly unfollowing...');

      // Wait random time then unfollow
      wait(random(2, 8)).then(() => {
        user.unfollow();
      }).then(() => {
        Output.error(`Unfollowed ${user.out()}`);
      }).then(() => {
        // next user
        Output.debug('next user');
        index++;

        // unlock
        waiting = false;
        return;
      });
    } else {
      // Prompt for unfollow make it very easy
      promptUnfollow(user).then(newMode => {
        if (newMode === MODES.AUTO) {
          mode = newMode;

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
    }
  }, 16);
});
