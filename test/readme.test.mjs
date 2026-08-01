import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('README documents public npm installation and all installer operations', async () => {
  const readme = await readFile('README.md', 'utf8');
  assert.match(readme, /public package on npmjs\.org/);
  assert.match(readme, /npm config set @hoangthai2171:registry https:\/\/registry\.npmjs\.org\/ --location=user/);
  assert.doesNotMatch(readme, /npm\.pkg\.github\.com/);
  assert.match(readme, /npx @hoangthai2171\/tiny-workers/);
  assert.match(readme, /tiny-workers update/);
  assert.match(readme, /tiny-workers uninstall/);
  assert.match(readme, /do not need to clone/i);
  for (const agent of ['Codex', 'Claude Code', 'Antigravity', 'OpenCode', 'Hermes Agent']) {
    assert.match(readme, new RegExp(`\\b${agent}\\b`));
  }
  assert.match(readme, /`tiny-pm\/` and `tiny-workers\/` directly/);
});
