'use strict';

const {
  add,
  subtract,
  multiply,
  divide,
  power
} = require('../src/calculator');

describe('calculator', () => {
  test('add returns the sum of two numbers', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
  });

  test('subtract returns the difference of two numbers', () => {
    expect(subtract(10, 4)).toBe(6);
    expect(subtract(0, 5)).toBe(-5);
  });

  test('multiply returns the product of two numbers', () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(5, 0)).toBe(0);
  });

  test('divide returns the quotient of two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  test('divide throws when dividing by zero', () => {
    expect(() => divide(1, 0)).toThrow('Division by zero');
  });

  // Only the positive-exponent branch is covered. The negative-exponent
  // branch in power() and the whole percentage() function are left
  // deliberately uncovered for Demo 04.
  test('power raises a base to a positive exponent', () => {
    expect(power(2, 3)).toBe(8);
  });
});
