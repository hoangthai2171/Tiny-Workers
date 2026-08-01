import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('publishing workflow has release, test, and package permissions gates', async () => {
  const workflow = await readFile('.github/workflows/publish.yml', 'utf8');
  assert.match(workflow, /release:\s*\n\s*types: \[published\]/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /packages: write/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm publish/);
});
