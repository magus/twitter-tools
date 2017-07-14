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
  const text = stringifyArgs(args);

  // Ensure empty args write nothing
  if (!text) spinner.text = '';

  spinner.start(text);
  spinner.stopAndPersist({ symbol, text });
}

function out(...args: Args) {
  return outputPersist(undefined, ...args);
}

function debug(...args: Args) {
  if (!DEBUG) return;

  return outputPersist('🐞 ', ...args);
}

function start(...args: Args): void {
  spinner.start(stringifyArgs(args));
}

function done(...args: Args): void {
  spinner.start(stringifyArgs(args));
  spinner.succeed();
}

function error(...args: Args): void {
  spinner.start(stringifyArgs(args));
  spinner.fail();
}

function warn(...args: Args): void {
  spinner.start(stringifyArgs(args));
  spinner.warn();
}

function info(...args: Args): void {
  spinner.start(stringifyArgs(args));
  spinner.info();
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
