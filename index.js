'use strict';

/** @template T */
class ErrorWithCause extends Error {
  /**
   * @param {string} message
   * @param {{ cause?: T, constructorOpt?: function }} [options]
   */
  constructor (message, { cause, constructorOpt = ErrorWithCause } = {}) {
    super(message);

    // FIXME: Maybe follow https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
    this.cause = cause;
    this.message = message;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, constructorOpt);
    }
  }
}

// TODO: Probably skip this one, quite non-standard :/
// /**
//  * @template T
//  * @augments {ErrorWithCause<T>}
//  */
// class ErrorWithVerboseCause extends ErrorWithCause {
//   /**
//    * @param {string} message
//    * @param {{ cause?: T, constructorOpt?: function }} [options]
//    */
//   constructor (message, { cause, constructorOpt = ErrorWithVerboseCause } = {}) {
//     if (cause) {
//       message += ': ' + cause;
//     }

//     super(message, { cause, constructorOpt });
//   }
// }

/**
 * @template {Error} T
 * @param {unknown} err
 * @param {new(...args: any[]) => T} reference
 * @returns {T|undefined}
 */
const findCauseByReference = (err, reference) => {
  if (!(err instanceof Error)) return;

  /**
   * Ensures we don't go circular
   *
   * @type {Set<Error>}
   */
  const seen = new Set();

  /** @type {Error|undefined} */
  let currentErr = err;

  while (currentErr && !seen.has(currentErr)) {
    seen.add(currentErr);

    if (currentErr instanceof reference) {
      // @ts-ignore
      return currentErr;
    }

    currentErr = getErrorCause(currentErr);
  }
};

/**
 * @param {Error|{ cause?: unknown|(()=>err)}} err
 * @returns {Error|undefined}
 */
const getErrorCause = (err) => {
  /** @type {unknown} */
  // @ts-ignore
  const cause = err.cause;

  // VError / NError style causes
  if (typeof cause === 'function') return cause();
  if (!(cause instanceof Error)) return;

  return cause;
};

/**
 * Internal method that keeps a track of which stack traces we have already added, to avoid circular recursion
 *
 * @private
 * @param {Error} err
 * @param {Set<Error>} seen
 * @returns {string}
 */
const _stackWithCauses = (err, seen) => {
  if (!(err instanceof Error)) return '';

  // Ensure we don't go circular or crazily deep
  if (seen.has(err)) return '';
  seen.add(err);

  const cause = getErrorCause(err);

  // TODO: Follow up in https://github.com/nodejs/node/issues/38725#issuecomment-920309092 on how to log stuff

  if (cause) {
    return (err.stack + '\ncaused by: ' + _stackWithCauses(cause, seen));
  }

  return err.stack || '';
};

/**
 * @param {Error} err
 * @returns {string}
 */
const stackWithCauses = (err) => _stackWithCauses(err, new Set());

module.exports = {
  ErrorWithCause,
  // ErrorWithVerboseCause,
  findCauseByReference,
  getErrorCause,
  stackWithCauses,
};