# Pony Cause

Helpers and ponyfill for [Error Causes](https://github.com/tc39/proposal-error-cause)

[![npm version](https://img.shields.io/npm/v/pony-cause.svg?style=flat)](https://www.npmjs.com/package/pony-cause)
[![npm downloads](https://img.shields.io/npm/dm/pony-cause.svg?style=flat)](https://www.npmjs.com/package/pony-cause)
[![Module type: CJS+ESM](https://img.shields.io/badge/module%20type-cjs%2Besm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)
[![Types in JS](https://img.shields.io/badge/types_in_js-yes-brightgreen)](https://github.com/voxpelli/types-in-js)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/voxpelli/eslint-config)
[![Follow @voxpelli](https://img.shields.io/twitter/follow/voxpelli?style=social)](https://twitter.com/voxpelli)

## Exports

* [`ErrorWithCause`](#errorwithcause) - an `Error` ponyfill
* [`findCauseByReference`](#findcausebyreference) - finding an error of a specific type within the cause chain
* [`getErrorCause`](#geterrorcause) - getting the direct cause of an error, if there is any
* [`messageWithCauses`](#messagewithcauses) - gets the error message with the messages of its cause chain appended to it
* [`stackWithCauses`](#stackwithcauses) - gets a stack trace for the error + all its causes

## CJS + ESM

`pony-cause` is dual published as both CommonJS and ESM. Use whichever you like.

## `ErrorWithCause`

[Ponyfill](https://ponyfill.com/) of the `cause`-supporting `Error` class

```javascript
const { ErrorWithCause } = require('pony-cause');

try {
  // Something that can break
} catch (err) {
  throw new ErrorWithCause('Failed doing what I intended', { cause: err });
}
```

## `findCauseByReference`

Finding an error of a specific type within the cause chain. Is typescript friendly.

```javascript
const { findCauseByReference } = require('pony-cause');

try {
  // Something that can break
} catch (err) {
  /** @type {MySpecialError} */
  const specialErr = findCauseByReference(err, MySpecialError);

  if (specialErr && specialErr.specialProperty === 'specialValue') {
    // Its okay, chill!
  } else {
    throw err;
  }
}
```

Used to find a specific type of error in the chain of causes in an error.

Similar to [`VError.findCauseByName`](https://github.com/joyent/node-verror#verrorfindcausebynameerr-name) but resolves causes in both [Error Causes](https://github.com/tc39/proposal-error-cause) style, `.cause`, and [VError](https://github.com/joyent/node-verror) style, `.cause()` + takes a reference to the Error class that you are looking for rather than simply the name of it, as that enables the TypeScript types to properly type the returned error, typing it with the same type as the reference.

Can be useful if there's some extra data on it that can help determine whether it's an unexpected error or an error that can be handled.

If it's an error related to a HTTP request, then maybe the request can be retried? If its a database error that tells you about a duplicated row, then maybe you know how to work with that? Maybe forward that error to the user rather than show a `500` error?

_Note:_ [`findCauseByReference`](#findcausebyreference) has protection against circular causes

## `getErrorCause`

Getting the direct cause of an error, if there is any

```javascript
const { getErrorCause } = require('pony-cause');

try {
  // Something that can break
} catch (err) {
  const cause = getErrorCause(err);
}
```

The output is similar to [`VError.cause()`](https://github.com/joyent/node-verror#verrorcauseerr) but resolves causes in both [Error Causes](https://github.com/tc39/proposal-error-cause) style, `.cause`, and [VError](https://github.com/joyent/node-verror) style, `.cause()`.

Always return an `Error`, a subclass of `Error` or `undefined`. If a cause in [Error Causes](https://github.com/tc39/proposal-error-cause) style cause is not an `Error` or a subclass of `Error`, it will be ignored and `undefined` will be returned.

## `messageWithCauses`

Gets the error message with the messages of its cause chain appended to it.

```javascript
const { messageWithCauses, ErrorWithCause } = require('pony-cause');

try {
  try {
    throw new Error('First error');
  } catch (err) {
    throw new ErrorWithCause('Second error', { cause: err });
  }
} catch (err) {
  // Logs: "Second error: First error"
  console.log(messageWithCauses(err));
}
```

The output is similar to the standard `VError` behaviour of [appending `message` with the `cause.message`](https://github.com/joyent/node-verror#public-properties), separating the two with a `: `.

Since [Error Causes](https://github.com/tc39/proposal-error-cause) doesn't do this, [`messageWithCauses`](#messagewithcauses) exist to mimic that behaviour.

It respects `VError` messages, it won't append any error message of their causes, though it will walk past the `VError` causes to see if there's a non-VError cause up the chain and then append that.

The reason to use this method is explained by `VError`:

> The idea is that each layer in the stack annotates the error with a description of what it was doing. The end result is a message that explains what happened at each level.

If an inner error has a message `ENOENT, stat '/nonexistent'`, an outer error wraps it and adds `Can't perform X` and maybe one more error wraps that and adds `Can't start program`, then [`messageWithCauses`](#messagewithcauses) will join those three errors together when providing it with the outer most error and return `Can't start program: Can't perform X: ENOENT, stat '/nonexistent'` which provides details about both cause and effect as well as the connection between the two – each which on their own would be a lot harder to understand the impact of.

_Note:_ [`messageWithCauses`](#messagewithcauses) has protection against circular causes

## `stackWithCauses`

Gets a stack trace for the error + all its causes.

```javascript
const { stackWithCauses } = require('pony-cause');

try {
  // Something that can break
} catch (err) {
  console.log('We had a mishap:', stackWithCauses(err));
}
```

The output is similar to [`VError.fullStack()`](https://github.com/joyent/node-verror#verrorfullstackerr) but resolves causes in both [Error Causes](https://github.com/tc39/proposal-error-cause) style, `.cause`, and [VError](https://github.com/joyent/node-verror) style, `.cause()`.

_Note:_ [`stackWithCauses`](#stackwithcauses) has protection against circular causes

Output looks like:

```
Error: something really bad happened here
    at Object.<anonymous> (/examples/fullStack.js:5:12)
    at Module._compile (module.js:409:26)
    at Object.Module._extensions..js (module.js:416:10)
    at Module.load (module.js:343:32)
    at Function.Module._load (module.js:300:12)
    at Function.Module.runMain (module.js:441:10)
    at startup (node.js:139:18)
    at node.js:968:3
caused by: Error: something bad happened
    at Object.<anonymous> (/examples/fullStack.js:3:12)
    at Module._compile (module.js:409:26)
    at Object.Module._extensions..js (module.js:416:10)
    at Module.load (module.js:343:32)
    at Function.Module._load (module.js:300:12)
    at Function.Module.runMain (module.js:441:10)
    at startup (node.js:139:18)
    at node.js:968:3
```

## Similar modules

* [`verror`](https://www.npmjs.com/package/verror) – a module which has long enabled error causes in javascript. Superseded by the new Error Cause proposal. Differs in that`.cause` represents a function that returns the cause, its not the cause itself.
* [`@netflix/nerror`](https://www.npmjs.com/package/@netflix/nerror) – a Netflix fork of `verror`
* [`error-cause`](https://www.npmjs.com/package/error-cause) – strict polyfill for the Error Cause proposal. Provides no helpers or similar to achieve `VError`-like functionality, which `pony-cause` does.

## See also

* [Pony Cause announcement blog post](https://dev.to/voxpelli/pony-cause-1-0-error-causes-2l2o)
* [Pony Cause announcement tweet](https://twitter.com/voxpelli/status/1438476680537034756)
* [Error Cause implementations](https://github.com/tc39/proposal-error-cause#implementations)
