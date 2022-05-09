/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="chai" />

'use strict';

import chai from 'chai';
import { ErrorWithCause } from '../index.mjs';

chai.should();

describe('ESM ErrorWithCause', () => {
  it('should set cause when provided', () => {
    const cause = new Error('Bar');
    const err = new ErrorWithCause('Foo', { cause });

    err.should.have.property('cause', cause);
    err.should.have.property('message', 'Foo');
  });
});
