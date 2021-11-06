/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="chai" />

'use strict';

const chai = require('chai');

const should = chai.should();

const VError = require('verror');

const {
  ErrorWithCause,
  findCauseByReference,
} = require('..');

class SubError extends Error {}

describe('findCauseByReference()', () => {
  describe('should have a resilient API which', () => {
    it('should handle being given nothing', () => {
      // @ts-ignore
      const result = findCauseByReference();
      should.not.exist(result);
    });

    it('should handle being given only an error', () => {
      // @ts-ignore
      const result = findCauseByReference(new Error('Yay'));
      should.not.exist(result);
    });

    it('should return nothing if given a non-error', () => {
      // @ts-ignore
      const result = findCauseByReference(true, true);
      should.not.exist(result);
    });

    it('should return nothing if given null', () => {
      // @ts-ignore
      // eslint-disable-next-line unicorn/no-null
      const result = findCauseByReference(null, null);
      should.not.exist(result);
    });

    it('should return nothing if given a non-error reference', () => {
      // @ts-ignore
      const result = findCauseByReference(new Error('yay'), true);
      should.not.exist(result);
    });

    it('should return nothing if given a non-Error constructor as reference', () => {
      class Foo {}
      // @ts-ignore
      const result = findCauseByReference(new Error('yay'), Foo);
      should.not.exist(result);
    });
  });

  it('should return input if its an instance of reference', () => {
    const err = new SubError('Foo');
    const result = findCauseByReference(err, SubError);
    should.exist(result);
    result?.should.equal(err);
  });

  it('should return input if its an instance of a parent of reference', () => {
    const err = new SubError('Foo');
    const result = findCauseByReference(err, Error);
    should.exist(result);
    result?.should.equal(err);
  });

  it('should not return input if its not an instance of reference', () => {
    const err = new Error('Foo');
    const result = findCauseByReference(err, SubError);
    should.not.exist(result);
  });

  it('should return input cause if its an instance of reference', () => {
    const cause = new SubError('Foo');
    const err = new ErrorWithCause('Bar', { cause });
    const result = findCauseByReference(err, SubError);
    should.exist(result);
    result?.should.equal(cause);
  });

  it('should return input VError cause if its an instance of reference', () => {
    const cause = new SubError('Foo');
    const err = new VError(cause, 'Bar');
    const result = findCauseByReference(err, SubError);
    should.exist(result);
    result?.should.equal(cause);
  });

  it('should not go infinite on circular error causes', () => {
    const cause = new ErrorWithCause('Foo');
    const err = new ErrorWithCause('Bar', { cause });

    cause.cause = err;

    const result = findCauseByReference(err, SubError);
    should.not.exist(result);
  });
});
