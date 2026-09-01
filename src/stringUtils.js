'use strict';

/**
 * Small string helpers.
 *
 * NOTE FOR DEMO 04 (code coverage automatic enablement):
 * At least one branch here is deliberately left untested so the generated
 * coverage report shows a realistic, sub-100% number.
 */

function capitalize(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return '';
  }
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function truncate(input, maxLength) {
  if (typeof input !== 'string') {
    return '';
  }
  if (input.length <= maxLength) {
    return input;
  }
  return input.slice(0, maxLength) + '...';
}

/**
 * Deliberately UNTESTED branch: the `separator` override path is never
 * exercised by test/stringUtils.test.js.
 */
function slugify(input, separator) {
  const sep = separator || '-';
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^${sep}+|${sep}+$`, 'g'), '');
}

module.exports = {
  capitalize,
  truncate,
  slugify
};
