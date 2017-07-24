// @flow
import Output from 'utils/Output';

type VerifyStringFunc = (key: string) => boolean;

export default function promptKey(prompt: string, isValidKey: VerifyStringFunc) {
  const stdin = process.stdin;

  // without this, we would only get streams once enter is pressed
  // $FlowFixMe
  stdin.setRawMode(true);

  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  stdin.resume();

  // i don't want binary, do you?
  stdin.setEncoding( 'utf8' );

  Output.start(prompt);

  return new Promise(resolve => {
    const handleResolve = key => {
      // cleanup listener
      stdin.removeListener('data', onData);
      // put stdin back how we found it
      // $FlowFixMe
      stdin.setRawMode(false);
      stdin.pause();

      // call onKey handler
      resolve(key);
    };

    const onData = key => {
      // ctrl+c exits prompt
      if (key === '\u0003') return process.exit();

      // prompt until valid key
      if (!isValidKey(key)) {
        Output.warn('invalid input');
        Output.start(prompt);
        return;
      }

      // resolve with valid key
      handleResolve(key);
    };

    // on any data into stdin
    stdin.on('data', onData);
  });
}
