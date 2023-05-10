/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="chai" />

'use strict';

const chai = require('chai');

const should = chai.should();

const VError = require('verror');

const {
  ErrorWithCause,
  getErrorCause,
} = require('..');

class SubError extends Error {}

describe('getErrorCause()', () => {
  describe('should have a resilient API which', () => {
    it('should handle being given nothing', () => {
      // @ts-ignore
      const result = getErrorCause();
      should.not.exist(result);
    });

    it('should return nothing if given a non-error', () => {
      // @ts-ignore
      const result = getErrorCause(true);
      should.not.exist(result);
    });

    it('should return nothing if given null', () => {
      // @ts-ignore
      // eslint-disable-next-line unicorn/no-null
      const result = getErrorCause(null);
      should.not.exist(result);
    });

    it('should return nothing if given a non-cause Error', () => {
      const result = getErrorCause(new Error('Foo'));
      should.not.exist(result);
    });
  });

  describe('with Error Cause input', () => {
    it('should return cause', () => {
      const cause = new SubError('Foo');
      const err = new ErrorWithCause('Bar', { cause });
      const result = getErrorCause(err);
      should.exist(result);
      (result || {}).should.equal(cause);
    });

    it('should not return non-Error cause', () => {
      const err = new ErrorWithCause('Bar', {
        // @ts-ignore Can be removed when we no longer support TS 4.7
        cause: '123',
      });
      const result = getErrorCause(err);
      should.not.exist(result);
    });
  });

  describe('with VError compatibility', () => {
    it('should return cause', () => {
      const cause = new SubError('Foo');
      const err = new VError(cause, 'Bar');
      const result = getErrorCause(err);
      should.exist(result);
      (result || {}).should.equal(cause);
    });

    it('should not return non-Error cause', () => {
      const err = { cause () { return '123'; } };
      const result = getErrorCause(err);
      should.not.exist(result);
    });
  });
});
