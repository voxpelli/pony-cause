const { ErrorWithCause } = require('pony-cause');

throw new ErrorWithCause('Wow', { cause: new Error('Yay') });
