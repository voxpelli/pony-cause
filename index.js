'use strict';

/** @template [T=undefined] */
class ErrorWithCause extends Error { // linemod-prefix-with: export
  /**
   * @param {string} message
   * @param {{ cause?: T }} [options]
   */
  constructor (message, { cause } = {}) {
    super(message);

    /** @type {string} */
    this.name = ErrorWithCause.name;
    if (cause) {
      /** @type {T} */
      this.cause = cause;
    }
    /** @type {string} */
    this.message = message;
  }
}

/**
 * @template {Error} T
 * @param {unknown} err
 * @param {new(...args: any[]) => T} reference
 * @returns {T|undefined}
 */
const findCauseByReference = (err, reference) => { // linemod-prefix-with: export
  if (!err || !reference) return;
  if (!(err instanceof Error)) return;
  if (
    !(reference.prototype instanceof Error) &&
    // @ts-ignore
    reference !== Error
  ) return;

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
const getErrorCause = (err) => { // linemod-prefix-with: export
  if (!err) return;

  /** @type {unknown} */
  // @ts-ignore
  const cause = err.cause;

  // VError / NError style causes
  if (typeof cause === 'function') {
    // @ts-ignore
    const causeResult = err.cause();

    return causeResult instanceof Error
      ? causeResult
      : undefined;
  } else {
    return cause instanceof Error
      ? cause
      : undefined;
  }
};

/**
 * Internal method that keeps a track of which error we have already added, to avoid circular recursion
 *
 * @private
 * @param {Error} err
 * @param {Set<Error>} seen
 * @returns {string}
 */
const _stackWithCauses = (err, seen) => {
  if (!(err instanceof Error)) return '';

  const stack = err.stack || '';

  // Ensure we don't go circular or crazily deep
  if (seen.has(err)) {
    return stack + '\ncauses have become circular...';
  }

  const cause = getErrorCause(err);

  if (cause) {
    seen.add(err);
    return (stack + '\ncaused by: ' + _stackWithCauses(cause, seen));
  } else if (Object.prototype.hasOwnProperty.call(err, 'cause')) {
    /** @type {string} */
    let stringified;
    try {
      // @ts-ignore
      stringified = JSON.stringify(err.cause);
    } catch {
      stringified = '<failed to stringify value>';
    }
    return (stack + '\ncaused by: ' + stringified);
  } else {
    return stack;
  }
};

/**
 * @param {Error} err
 * @returns {string}
 */
const stackWithCauses = (err) => _stackWithCauses(err, new Set()); // linemod-prefix-with: export

/**
 * Internal method that keeps a track of which error we have already added, to avoid circular recursion
 *
 * @private
 * @param {Error} err
 * @param {Set<Error>} seen
 * @param {boolean} [skip]
 * @returns {string}
 */
const _messageWithCauses = (err, seen, skip) => {
  if (!(err instanceof Error)) return '';

  const message = skip ? '' : (err.message || '');

  // Ensure we don't go circular or crazily deep
  if (seen.has(err)) {
    return message + ': ...';
  }

  const cause = getErrorCause(err);

  if (cause) {
    seen.add(err);

    // @ts-ignore
    const skipIfVErrorStyleCause = typeof err.cause === 'function';

    return (message +
      (skipIfVErrorStyleCause ? '' : ': ') +
      _messageWithCauses(cause, seen, skipIfVErrorStyleCause));
  } else {
    return message;
  }
};

/**
 * @param {Error} err
 * @returns {string}
 */
const messageWithCauses = (err) => _messageWithCauses(err, new Set()); // linemod-prefix-with: export

module.exports = {      // linemod-remove
  ErrorWithCause,       // linemod-remove
  findCauseByReference, // linemod-remove
  getErrorCause,        // linemod-remove
  stackWithCauses,      // linemod-remove
  messageWithCauses,    // linemod-remove
};                      // linemod-remove
