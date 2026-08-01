import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

test('prints usage for an unknown action', async () => {
  await assert.rejects(
    execFileAsync(process.execPath, ['bin/tiny-workers.mjs', 'wrong-action']),
    (error) => error.code === 1 && error.stderr.includes('Usage: tiny-workers'),
  );
});

test('npm pack contains the executable and both packaged skills', async () => {
  const { stdout } = await execFileAsync('npm', ['pack', '--dry-run', '--json']);
  const [{ files }] = JSON.parse(stdout);
  const paths = files.map((file) => file.path);

  assert(paths.includes('bin/tiny-workers.mjs'));
  assert(paths.includes('skills/tiny-pm/SKILL.md'));
  assert(paths.includes('skills/tiny-workers/SKILL.md'));
  assert(!paths.some((file) => file.startsWith('test/')));
});
