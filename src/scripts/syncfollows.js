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

//////////////////////////////////////////////////
//                      MAIN                    //
//////////////////////////////////////////////////

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
    listMemberMap[user.id] = true;
  });
  Output.debug('listMemberMap', Object.keys(listMemberMap).length);

  // Iterate following and generate list of members we need to add
  const idsToAddToList = [];
  Object.keys(followingMap).forEach(userID => {
    if (listMemberMap[userID]) return;
    idsToAddToList.push(userID);
  });

  // Output `Adding X users to list...`
  Output.start(`Syncing ${idsToAddToList.length} friends to [LIST]${list.name}`);

  const promises = [];

  // Chunks into 100 user chunks
  const chunks = _chunk(idsToAddToList, 100);
  Output.debug('chunks', chunks.length);
  chunks.forEach((chunk, i) => {
    Output.debug(`chunk[${i}]`, chunk.length);

    // Create list membership for missing users
    // https://dev.twitter.com/rest/reference/post/lists/members/create_all
    const user_id = chunk.join(',');
    promises.push(
      Twitter.post('lists/members/create_all', {
        owner_id: list.user.id,
        slug: list.slug,
        user_id,
      })
    );
  });

  Promise.all(promises).then(results => {
    Output.debug('promise all results', results.length);
    Output.done('Sync complete.');
  });
});
