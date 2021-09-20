# Pony Cause

Ponyfill and helpers for [Error Causes](https://github.com/tc39/proposal-error-cause)

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/standard/semistandard)

## Usage

### `ErrorWithCause`, creating an error with a cause

```javascript
const { ErrorWithCause } = require('pony-cause');

try {
  // Something that can break
} catch (err) {
  throw new ErrorWithCause('Failed doing what I intended', { cause: err });
}
```

### `stackWithCauses`, getting full stack trace for error + all causes

```javascript
const { stackWithCauses } = require('pony-cause');

try {
  // Something that can break
} catch (err) {
  console.log('We had a mishap:', stackWithCauses(err));
}
```

The output is similar to [`VError.fullStack()`](https://github.com/joyent/node-verror#verrorfullstackerr) but resolves causes in both [Error Causes](https://github.com/tc39/proposal-error-cause) style, `.cause`, and [VError](https://github.com/joyent/node-verror) style, `.cause()`.

_Note:_ Has protection against circular causes

Output looks like:

```
Error: something really bad happened here: something bad happened
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

### `getErrorCause`, getting the cause of an error

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

### `findCauseByReference`, finding a specific type of error in the cause chain

```javascript
const { findCauseByReference } = require('pony-cause');

try {
  // Something that can break
} catch (err) {
  /** @type {MySpecialError} */
  const specialErr = findCauseByReference(err, MySpecialError);

  if (specialErr && specialErr.specialProperty = 'specialValue') {
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

## Similar modules

* [`verror`](https://www.npmjs.com/package/verror) – a module which has long enabled error causes in javascript. Superseded by the new Error Cause proposal. Differs in that`.cause` represents a function that returns the cause, its not the cause itself.
* [`@netflix/nerror`](https://www.npmjs.com/package/@netflix/nerror) – a Netflix fork of `verror`

## See also

* [Announcement blog post](https://dev.to/voxpelli/pony-cause-1-0-error-causes-2l2o)
* [Announcement tweet](https://twitter.com/voxpelli/status/1438476680537034756)
