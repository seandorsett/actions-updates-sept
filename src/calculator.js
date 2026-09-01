'use strict';

/**
 * Simple arithmetic helpers.
 *
 * NOTE FOR DEMO 04 (code coverage automatic enablement):
 * Some branches in this file are deliberately left untested so that the
 * coverage number GitHub reports is interesting rather than 100%.
 */

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

/**
 * Deliberately UNTESTED branch: the negative-exponent path below is never
 * exercised by test/calculator.test.js. This keeps coverage below 100%.
 */
function power(base, exponent) {
  if (exponent < 0) {
    return 1 / Math.pow(base, Math.abs(exponent));
  }
  return Math.pow(base, exponent);
}

/**
 * Deliberately UNTESTED function. Left uncovered on purpose for Demo 04.
 */
function percentage(value, total) {
  if (total === 0) {
    return 0;
  }
  return (value / total) * 100;
}

module.exports = {
  add,
  subtract,
  multiply,
  divide,
  power,
  percentage
};
