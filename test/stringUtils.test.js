'use strict';

const { capitalize, truncate, slugify } = require('../src/stringUtils');

describe('stringUtils', () => {
  test('capitalize uppercases the first character', () => {
    expect(capitalize('dxc')).toBe('Dxc');
    expect(capitalize('github actions')).toBe('Github actions');
  });

  test('capitalize returns an empty string for non-strings and empty input', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize(null)).toBe('');
  });

  test('truncate leaves short strings untouched', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  test('truncate appends an ellipsis to long strings', () => {
    expect(truncate('office hour demo', 6)).toBe('office...');
  });

  // Only the default-separator branch is covered. Passing an explicit
  // separator is left deliberately uncovered for Demo 04.
  test('slugify uses a dash separator by default', () => {
    expect(slugify('GitHub Actions Office Hour')).toBe(
      'github-actions-office-hour'
    );
  });
});
