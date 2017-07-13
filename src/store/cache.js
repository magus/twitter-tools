// @flow
import Twitter from 'api/Twitter';
import FileCache from 'utils/FileCache';

export default new FileCache(`${__dirname}/../../cache`, Twitter.get);
