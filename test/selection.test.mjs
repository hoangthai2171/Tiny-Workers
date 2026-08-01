import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSelections } from '../src/selection.mjs';

test('accepts comma- and space-separated menu numbers without duplicates', () => {
  assert.deepEqual(parseSelections('1, 3 2, 3', 5), [0, 2, 1]);
});

test('rejects invalid menu input', () => {
  for (const input of ['', 'zero', '0', '6']) {
    assert.throws(() => parseSelections(input, 5), {
      message: 'Choose one or more valid menu numbers.',
    });
  }
});
