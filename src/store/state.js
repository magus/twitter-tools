type UserMap = { [id: number]: any };
type State = {
  users: UserMap,
  followers: UserMap,
};

const STATE: State = {
  users: {},
  followers: {},
};

export default STATE;
