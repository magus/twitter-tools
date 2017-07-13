type UserMap = { [id: number]: any };
type State = {
  // ordered array of user ids (ordered by follow date)
  following: Array<number>,

  // hash for user id to user entities
  users: UserMap,

  // hash for user id to user entities
  followers: UserMap,
};

const STATE: State = {
  following: [],
  users: {},
  followers: {},
};

export default STATE;
