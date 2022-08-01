const { ErrorWithCause } = require('..');

throw new ErrorWithCause('Wow', { cause: new Error('Yay') });
