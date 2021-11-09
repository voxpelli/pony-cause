/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="chai" />

'use strict';

const chai = require('chai');

const should = chai.should();

const VError = require('verror');

const {
  ErrorWithCause,
  messageWithCauses,
} = require('..');

describe('messageWithCauses()', () => {
  describe('should have a resilient API which', () => {
    it('should handle being given nothing', () => {
      // @ts-ignore
      const result = messageWithCauses();
      should.exist(result);
      result.should.equal('');
    });

    it('should handle being given null', () => {
      // @ts-ignore
      // eslint-disable-next-line unicorn/no-null
      const result = messageWithCauses(null);
      should.exist(result);
      result.should.equal('');
    });

    it('should handle an undefined message attribute', () => {
      const err = new Error('foo');
      // @ts-ignore
      err.message = undefined;

      const result = messageWithCauses(err);
      should.exist(result);
      result.should.equal('');
    });
  });

  it('should return the message', () => {
    const err = new Error('Foo');
    const result = messageWithCauses(err);
    should.exist(result);
    result.should.equal('Foo');
  });

  it('should append causes to the message', () => {
    const cause = new Error('Foo');
    const err = new ErrorWithCause('Bar', { cause });
    const result = messageWithCauses(err);
    should.exist(result);
    result.should.equal('Bar: Foo');
  });

  it('should append VError causes to the message', () => {
    const cause1 = new Error('Foo');
    const cause2 = new ErrorWithCause('Abc', { cause: cause1 });
    const cause3 = new VError(cause2, 'Bar');
    const err = new ErrorWithCause('Xyz', { cause: cause3 });

    const result = messageWithCauses(err);
    should.exist(result);
    result.should.equal('Xyz: Bar: Abc: Foo');
  });

  it('should not go infinite on circular error causes', () => {
    const cause = new ErrorWithCause('Foo');
    const err = new ErrorWithCause('Bar', { cause });

    cause.cause = err;

    const result = messageWithCauses(err);
    result.should.equal('Bar: Foo: Bar: ...');
  });
});
