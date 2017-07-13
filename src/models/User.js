// @flow
import State from 'store/state';

class User {
  _user: any;

  constructor(user: any) {
    this._user = user;
  }

  name() {
    return `@${this._user.screen_name} (${this._user.name})`;
  }

  out() {
    const followBackTag = this.doesFollowBack() ? '[F]' : '   ';
    return `${followBackTag} ${this.name()}`;
  }

  doesFollowBack() {
    return !!State.followers[this._user.id];
  }
}

export default User;
