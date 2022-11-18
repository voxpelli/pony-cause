import { ErrorWithCause } from 'pony-cause';

throw new ErrorWithCause('Wow', { cause: new Error('Yay') });
