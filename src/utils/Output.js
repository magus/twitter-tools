// @flow
import ora from 'ora';

const DEBUG = false;

const spinner = ora().start();
spinner.stopAndPersist({ symbol: '👾 ', text: 'manage-following output initialized...' });

type Args = Array<*>;

function stringifyArgs(args: Args): string {
  const stringifiedArgs = args.map(arg => {
    if (typeof(arg) !== 'object') return arg;

    return JSON.stringify(arg, null, 2);
  });

  return stringifiedArgs.join(' ');
}

function outputPersist(symbol = ' ', ...args: Args) {
  symbol += ' ';
  const text = stringifyArgs(args);
  spinner.stopAndPersist({ symbol, text });
}

function out(...args: Args) {
  return outputPersist(...args);
}

function debug(...args: Args) {
  if (!DEBUG) return;

  return outputPersist('🐞 ', ...args);
}

function start(...args: Args): void {
  spinner.start(stringifyArgs(args));
}

function done(...args: Args): void {
  spinner.succeed(stringifyArgs(args));
}

function error(...args: Args): void {
  spinner.fail(stringifyArgs(args));
}

function warn(...args: Args): void {
  spinner.warn(stringifyArgs(args));
}

function info(...args: Args): void {
  spinner.info(stringifyArgs(args));
}

export default {
  out,
  debug,

  start,
  done,
  error,
  warn,
  info,
};
