import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('publishing workflow has release, test, and public npm registry gates', async () => {
  const workflow = await readFile('.github/workflows/publish.yml', 'utf8');
  assert.match(workflow, /release:\s*\n\s*types: \[published\]/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /node-version: 20/);
  assert.match(workflow, /registry-url: https:\/\/registry\.npmjs\.org/);
  assert.match(workflow, /NODE_AUTH_TOKEN: \$\{\{ secrets\.NPM_TOKEN \}\}/);

  const commands = [
    'npm ci --ignore-scripts',
    'npm test',
    'npm pack --dry-run',
    'npm publish --access public',
  ];
  const positions = commands.map((command) => workflow.indexOf(`- run: ${command}`));
  assert(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
});
