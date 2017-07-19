// @flow
import State from 'store/state';
import Cache from 'store/cache';

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
    Output.debug('selectedList.name', selectedList.name);
    return selectedList;
  });
}).then(list => {
  Output.info('State.following', State.following.length);

  // Get current members of list
  // Iterate following and generate list of members we need to add
  // Output `Adding X users to list...`
  Output.start(`Syncing ${'N'} friends to [LIST]${list.name}`);
  // Chunks into 100 user chunks

  // // Create list membership for missing users
  // // https://dev.twitter.com/rest/reference/post/lists/members/create_all
  // const user_id = [].join(',');
  // Cache.post('lists/members/create_all', { list_id: list.id, user_id });
});
