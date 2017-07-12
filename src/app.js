// @flow
import fs from 'fs';
import Twit from 'twit';
import ora from 'ora';

// Read in secrets from config/secrets.json
const SECRETS = require('../config/secrets.json');

const T = new Twit({
  consumer_key:         SECRETS.consumer_key,
  consumer_secret:      SECRETS.consumer_secret,
  access_token:         SECRETS.access_token,
  access_token_secret:  SECRETS.access_token_secret,

  // optional HTTP request timeout to apply to all requests.
  timeout_ms:           60*1000,
});


const STATE = {
  followers: [],
};

const spinner = ora('Retrieving following list...').start();
T.get('friends/list', { count: 200 })
  .then(({ data }) => {
    spinner.succeed(`${data.users.length} followers returned`);
  });
