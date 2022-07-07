/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="chai" />

'use strict';

const chai = require('chai');

const should = chai.should();

const VError = require('verror');

const {
  ErrorWithCause,
  stackWithCauses,
} = require('..');

describe('stackWithCauses()', () => {
  describe('should have a resilient API which', () => {
    it('should handle being given nothing', () => {
      // @ts-ignore
      const result = stackWithCauses();
      should.exist(result);
      result.should.equal('');
    });

    it('should handle being given null', () => {
      // @ts-ignore
      // eslint-disable-next-line unicorn/no-null
      const result = stackWithCauses(null);
      should.exist(result);
      result.should.equal('');
    });

    it('should handle an undefined stack attribute', () => {
      const err = new Error('foo');
      // @ts-ignore
      err.stack = undefined;

      const result = stackWithCauses(err);
      should.exist(result);
      result.should.equal('');
    });
  });

  it('should return the stack trace', () => {
    const err = new Error('foo');
    err.stack = 'abc123';

    const result = stackWithCauses(err);
    should.exist(result);
    result.should.equal('abc123');
  });

  it('should append causes to the stack trace', () => {
    const cause = new Error('foo');
    cause.stack = 'abc123';

    const err = new ErrorWithCause('foo', { cause });
    err.stack = 'xyz789';

    const result = stackWithCauses(err);
    should.exist(result);
    result.should.equal('xyz789\ncaused by: abc123');
  });

  it('should append VError causes to the stack trace', () => {
    const cause1 = new Error('Foo');
    const cause2 = new ErrorWithCause('Abc', { cause: cause1 });
    const cause3 = new VError(cause2, 'Bar');
    const err = new ErrorWithCause('Xyz', { cause: cause3 });

    const result = stackWithCauses(err);
    should.exist(result);

    result.should.match(/^ErrorWithCause: Xyz\n\s+at/);
    result.should.match(/\ncaused by: VError: Bar: Abc\n/);
    result.should.match(/\ncaused by: ErrorWithCause: Abc\n/);
    result.should.match(/\ncaused by: Error: Foo\n/);
  });

  it('should not go infinite on circular error causes', () => {
    const cause = new ErrorWithCause('Foo');
    const err = new ErrorWithCause('Bar', { cause });

    cause.stack = 'abc123';
    err.stack = 'xyz789';

    // @ts-ignore
    cause.cause = err;

    const result = stackWithCauses(err);
    result.should.equal('xyz789\ncaused by: abc123\ncaused by: xyz789\ncauses have become circular...');
  });

  describe('should append non-Error causes to the end of the cause trail', () => {
    it('for string causes', () => {
      const err = new ErrorWithCause('foo', { cause: 'string cause' });
      err.stack = 'xyz789';
      stackWithCauses(err).should.equal('xyz789\ncaused by: "string cause"');
    });

    it('for number causes', () => {
      const err = new ErrorWithCause('foo', { cause: 123 });
      err.stack = 'xyz789';
      stackWithCauses(err).should.equal('xyz789\ncaused by: 123');
    });

    it('for non-Error object causes', () => {
      const err = new ErrorWithCause('foo', { cause: { name: 'TypeError', message: 'foo' } });
      err.stack = 'xyz789';
      stackWithCauses(err).should.equal('xyz789\ncaused by: {"name":"TypeError","message":"foo"}');
    });

    it('should not throw for circular non-Error object causes', () => {
      const firstCause = { first: true };
      const secondCause = { second: true, firstCause };

      // @ts-ignore
      firstCause.secondCause = secondCause;

      const err = new ErrorWithCause('foo', { cause: firstCause });
      err.stack = 'xyz789';
      stackWithCauses(err).should.equal('xyz789\ncaused by: <failed to stringify value>');
    });

    // Copied from https://github.com/nodejs/node/blob/5e6f9c3e346b196ab299a3fce485d7aa5fbf3802/test/parallel/test-util-inspect.js#L663-L677
    it('for falsy causes', () => {
      const falsyCause1 = new ErrorWithCause('', { cause: false });
      delete falsyCause1.stack;

      // @ts-ignore
      // eslint-disable-next-line unicorn/no-null
      const falsyCause2 = new ErrorWithCause(undefined, { cause: null });
      falsyCause2.stack = '';

      const undefinedCause = new ErrorWithCause('', { cause: undefined });
      undefinedCause.stack = '';

      stackWithCauses(falsyCause1).should.equal('\ncaused by: false');
      stackWithCauses(falsyCause2).should.equal('\ncaused by: null');
      stackWithCauses(undefinedCause).should.equal('\ncaused by: undefined');
    });
  });
});
