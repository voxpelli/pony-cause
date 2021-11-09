/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="chai" />

'use strict';

const chai = require('chai');

chai.use(require('chai-string'));
chai.should();

const {
  ErrorWithCause,
} = require('..');

describe('ErrorWithCause', () => {
  it('should set cause when provided', () => {
    const cause = new Error('Bar');
    const err = new ErrorWithCause('Foo', { cause });

    err.should.have.property('cause', cause);
    err.should.have.property('message', 'Foo');
  });

  it('should handle missing options object', () => {
    const err = new ErrorWithCause('Foo');

    err.should.not.have.property('cause');
    err.should.have.property('message', 'Foo');
  });

  it('should handle empty options object', () => {
    (new ErrorWithCause('Foo', {})).should.not.have.property('cause');
  });

  it('should produce a proper stack trace', () => {
    const err = new ErrorWithCause('Foo');
    err.should.have.property('stack').that.is.a('string').which.startsWith('ErrorWithCause: Foo\n');
  });
});
