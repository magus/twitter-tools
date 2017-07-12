import fs from 'fs';
import Twit from 'twit';

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

console.log(T);
