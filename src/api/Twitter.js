// @flow
import fs from 'fs';
import path from 'path';
import Twit from 'twit';

import FileCache from 'utils/FileCache';
import Output from 'utils/Output';

// Read in secrets from config/secrets.json
import SECRETS from '../../config/secrets.json';

const T = new Twit({
  consumer_key:         SECRETS.consumer_key,
  consumer_secret:      SECRETS.consumer_secret,
  access_token:         SECRETS.access_token,
  access_token_secret:  SECRETS.access_token_secret,

  // optional HTTP request timeout to apply to all requests.
  timeout_ms:           60*1000,
});


type RequestMethod = 'get' | 'post';

function request(type: RequestMethod, endpoint: string, params: any) {
  Output.start(endpoint);

  return (
    T[type](endpoint, params)
    .then(({ resp, data }) => {
      if (resp.statusCode !== 200) {
        Output.error(resp.statusCode, endpoint, params);
        Output.error('resp', resp);
        Output.error('data', data);
      }

      Output.done();

      return data;
    })
  );
}

export default {
  get: request.bind(null, 'get'),
  post: request.bind(null, 'post'),
}
