// @flow

import invariant from 'invariant';
import { parsePredicate as p } from '../parser';
import simplify from './index';

describe('simplifier', () => {
  it('not true ~> false', () => {
    expect(simplify(p('not true'))).toEqual(p('false'));
  });

  it('not false ~> true', () => {
    expect(simplify(p('not false'))).toEqual(p('true'));
  });

  it('not not x ~> x', () => {
    expect(simplify(p('not (not x)'))).toEqual(p('x'));
  });

  it('not (x and y) ~> (not x) or (not y)', () => {
    expect(simplify(p('not (x and y)'))).toEqual(p('not x or not y'));
    expect(simplify(p('not (x and y and z)'))).toEqual(
      p('not x or not y or not z'),
    );
  });

  it('not (x OR y) ~> (not x) and (not y)', () => {
    expect(simplify(p('not (x or y)'))).toEqual(p('not x and not y'));
    expect(simplify(p('not (x or y or z)'))).toEqual(
      p('not x and not y and not z'),
    );
  });

  it('mixed', () => {
    expect(simplify(p('not (x or y and z)'))).toEqual(
      p('not x and (not y or not z)'),
    );
  });

  it('not forall: x ~> exists: not(x)', () => {
    expect(simplify(p('not (forall Foo foo: foo.isEnabled)'))).toEqual(
      p('exists Foo foo: not foo.isEnabled'),
    );

    // not exists(x) will NOT get simplified!
    expect(simplify(p('not (exists Foo foo: foo.isEnabled)'))).toEqual(
      p('not (exists Foo foo: foo.isEnabled)'),
    );
  });

  it('not x = y ~> x != y (and friends)', () => {
    expect(simplify(p('not (x = y)'))).toEqual(p('x != y'));
    expect(simplify(p('not (x != y)'))).toEqual(p('x = y'));
    expect(simplify(p('not (x > y)'))).toEqual(p('x <= y'));
    expect(simplify(p('not (x >= y)'))).toEqual(p('x < y'));
    expect(simplify(p('not (x < y)'))).toEqual(p('x >= y'));
    expect(simplify(p('not (x <= y)'))).toEqual(p('x > y'));
  });

  it('x and true ~> x', () => {
    expect(simplify(p('x and true'))).toEqual(p('x'));
    expect(simplify(p('x and false'))).toEqual(p('false'));
    expect(simplify(p('true and x'))).toEqual(p('x'));
    expect(simplify(p('false and x'))).toEqual(p('false'));

    expect(simplify(p('x and true and y'))).toEqual(p('x and y'));
    expect(simplify(p('x and false and y'))).toEqual(p('false'));
  });

  it('x or false ~> x', () => {
    expect(simplify(p('x or true'))).toEqual(p('true'));
    expect(simplify(p('x or false'))).toEqual(p('x'));
    expect(simplify(p('true or x'))).toEqual(p('true'));
    expect(simplify(p('false or x'))).toEqual(p('x'));

    expect(simplify(p('x or true or y'))).toEqual(p('true'));
    expect(simplify(p('x or false or y'))).toEqual(p('x or y'));
  });

  it('x => y ~> not x or y', () => {
    expect(simplify(p('x => y'))).toEqual(p('not x or y'));
    expect(simplify(p('not x => y'))).toEqual(p('x or y'));
    expect(simplify(p('x = 1 => y'))).toEqual(p('x != 1 or y'));
    expect(simplify(p('not (x => y)'))).toEqual(p('x and not y'));

    expect(simplify(p('x => false'))).toEqual(p('not x'));
    expect(simplify(p('x => true'))).toEqual(p('true'));
    expect(simplify(p('true => x'))).toEqual(p('x'));
    expect(simplify(p('false => x'))).toEqual(p('true'));
  });

  xit('tautologies', () => {
    // expect(simplify(p('1 = 1.0'))).toEqual(p('true'));
    // expect(simplify(p('1 >= 1'))).toEqual(p('true'));
    // expect(simplify(p('1 > 1'))).toEqual(p('false'));
    // expect(simplify(p('"hey" != "hi"'))).toEqual(p('true'));
    // expect(simplify(p('"hey" = "hi"'))).toEqual(p('false'));
  });
});