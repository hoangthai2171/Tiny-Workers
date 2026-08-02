import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runSkillOperation } from '../src/skill-operations.mjs';

const SKILL_NAMES = ['tiny-pm', 'tiny-planner', 'tiny-executor', 'tiny-workers'];
const SOURCE_SKILLS_DIRECTORY = fileURLToPath(new URL('../skills/', import.meta.url));

test('installs the complete Tiny-Workers skill set transactionally', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiny-workers-skill-test-'));
  const targetSkillsDirectory = path.join(root, 'target');
  t.after(() => rm(root, { recursive: true, force: true }));

  const result = await runSkillOperation({
    action: 'install',
    sourceSkillsDirectory: SOURCE_SKILLS_DIRECTORY,
    targetSkillsDirectory,
    confirm: async () => true,
  });

  assert.deepEqual(result, {
    status: 'installed',
    message: 'Installed Tiny-Workers skills.',
  });

  for (const name of SKILL_NAMES) {
    const installedFile = path.join(targetSkillsDirectory, name, 'SKILL.md');
    await access(installedFile);
    assert.match(await readFile(installedFile, 'utf8'), new RegExp(`^name: ${name}$`, 'm'));
    await access(path.join(targetSkillsDirectory, name, 'agents', 'openai.yaml'));
  }
});

test('updates and uninstalls all packaged skills', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiny-workers-skill-test-'));
  const targetSkillsDirectory = path.join(root, 'target');
  await mkdir(targetSkillsDirectory, { recursive: true });
  t.after(() => rm(root, { recursive: true, force: true }));

  for (const name of SKILL_NAMES) {
    await mkdir(path.join(targetSkillsDirectory, name), { recursive: true });
  }

  const updated = await runSkillOperation({
    action: 'update',
    sourceSkillsDirectory: SOURCE_SKILLS_DIRECTORY,
    targetSkillsDirectory,
    confirm: async () => true,
  });
  assert.deepEqual(updated, {
    status: 'updated',
    message: 'Updated Tiny-Workers skills.',
  });

  const removed = await runSkillOperation({
    action: 'uninstall',
    sourceSkillsDirectory: SOURCE_SKILLS_DIRECTORY,
    targetSkillsDirectory,
    confirm: async () => true,
  });
  assert.deepEqual(removed, {
    status: 'removed',
    message: 'Removed Tiny-Workers skills.',
  });

  for (const name of SKILL_NAMES) {
    await assert.rejects(access(path.join(targetSkillsDirectory, name)), { code: 'ENOENT' });
  }
});
