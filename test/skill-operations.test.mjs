import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runSkillOperation } from '../src/skill-operations.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiny-workers-'));
  const source = path.join(root, 'source');
  for (const name of ['tiny-pm', 'tiny-workers']) {
    await mkdir(path.join(source, name), { recursive: true });
    await writeFile(path.join(source, name, 'SKILL.md'), name);
  }
  return { root, source, target: path.join(root, 'target') };
}

test('install copies both skill folders', async () => {
  const { source, target } = await fixture();
  await runSkillOperation({ action: 'install', sourceSkillsDirectory: source, targetSkillsDirectory: target, confirm: async () => true });
  assert.equal(await readFile(path.join(target, 'tiny-workers', 'SKILL.md'), 'utf8'), 'tiny-workers');
  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'tiny-pm');
});

test('update preserves existing skills when replacement is declined', async () => {
  const { source, target } = await fixture();
  await mkdir(path.join(target, 'tiny-pm'), { recursive: true });
  await writeFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'old');
  const result = await runSkillOperation({ action: 'update', sourceSkillsDirectory: source, targetSkillsDirectory: target, confirm: async () => false });
  assert.equal(result.status, 'skipped');
  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'old');
});

test('uninstall removes only Tiny-Workers skill folders after confirmation', async () => {
  const { target } = await fixture();
  await mkdir(path.join(target, 'tiny-pm'), { recursive: true });
  await mkdir(path.join(target, 'tiny-workers'), { recursive: true });
  await mkdir(path.join(target, 'another-skill'), { recursive: true });
  await runSkillOperation({ action: 'uninstall', sourceSkillsDirectory: '', targetSkillsDirectory: target, confirm: async () => true });
  await assert.rejects(access(path.join(target, 'tiny-pm')));
  await access(path.join(target, 'another-skill'));
});
