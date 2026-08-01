import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
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

test('rejects a non-absolute target skills directory before filesystem access', async () => {
  await assert.rejects(
    runSkillOperation({
      action: 'uninstall',
      sourceSkillsDirectory: '',
      targetSkillsDirectory: 'relative/skills',
      confirm: async () => true,
    }),
    { message: 'Target skills directory must be an absolute path.' },
  );
});

test('install reports an installation-specific cancellation when replacement is declined', async () => {
  const { source, target } = await fixture();
  await mkdir(path.join(target, 'tiny-pm'), { recursive: true });

  const result = await runSkillOperation({
    action: 'install',
    sourceSkillsDirectory: source,
    targetSkillsDirectory: target,
    confirm: async () => false,
  });

  assert.deepEqual(result, { status: 'skipped', message: 'Installation cancelled.' });
});

test('update preserves existing skills when replacement is declined', async () => {
  const { source, target } = await fixture();
  await mkdir(path.join(target, 'tiny-pm'), { recursive: true });
  await writeFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'old');
  const result = await runSkillOperation({ action: 'update', sourceSkillsDirectory: source, targetSkillsDirectory: target, confirm: async () => false });
  assert.deepEqual(result, { status: 'skipped', message: 'Update cancelled.' });
  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'old');
});

test('update replaces both existing skill folders', async () => {
  const { source, target } = await fixture();
  for (const name of ['tiny-pm', 'tiny-workers']) {
    await mkdir(path.join(target, name), { recursive: true });
    await writeFile(path.join(target, name, 'SKILL.md'), `old-${name}`);
  }

  const result = await runSkillOperation({
    action: 'update',
    sourceSkillsDirectory: source,
    targetSkillsDirectory: target,
    confirm: async () => true,
  });

  assert.deepEqual(result, { status: 'updated', message: 'Updated Tiny-Workers skills.' });
  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'tiny-pm');
  assert.equal(await readFile(path.join(target, 'tiny-workers', 'SKILL.md'), 'utf8'), 'tiny-workers');
});

test('update validates both sources before replacing either existing folder', async () => {
  const { source, target } = await fixture();
  for (const name of ['tiny-pm', 'tiny-workers']) {
    await mkdir(path.join(target, name), { recursive: true });
    await writeFile(path.join(target, name, 'SKILL.md'), `old-${name}`);
  }
  await rm(path.join(source, 'tiny-workers'), { recursive: true });

  await assert.rejects(runSkillOperation({
    action: 'update',
    sourceSkillsDirectory: source,
    targetSkillsDirectory: target,
    confirm: async () => true,
  }));

  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'old-tiny-pm');
  assert.equal(await readFile(path.join(target, 'tiny-workers', 'SKILL.md'), 'utf8'), 'old-tiny-workers');
});

test('update rolls back both existing folders when a staged swap fails', async () => {
  const { source, target } = await fixture();
  for (const name of ['tiny-pm', 'tiny-workers']) {
    await mkdir(path.join(target, name), { recursive: true });
    await writeFile(path.join(target, name, 'SKILL.md'), `old-${name}`);
  }
  let renameCalls = 0;

  await assert.rejects(runSkillOperation({
    action: 'update',
    sourceSkillsDirectory: source,
    targetSkillsDirectory: target,
    confirm: async () => true,
    fileSystem: {
      rename: async (from, to) => {
        renameCalls += 1;
        if (renameCalls === 4) throw new Error('simulated staged swap failure');
        await rename(from, to);
      },
    },
  }), /simulated staged swap failure/);

  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'old-tiny-pm');
  assert.equal(await readFile(path.join(target, 'tiny-workers', 'SKILL.md'), 'utf8'), 'old-tiny-workers');
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

test('uninstall preserves both skill folders when removal is declined', async () => {
  const { target } = await fixture();
  for (const name of ['tiny-pm', 'tiny-workers']) {
    await mkdir(path.join(target, name), { recursive: true });
    await writeFile(path.join(target, name, 'SKILL.md'), `old-${name}`);
  }

  const result = await runSkillOperation({
    action: 'uninstall',
    sourceSkillsDirectory: '',
    targetSkillsDirectory: target,
    confirm: async () => false,
  });

  assert.deepEqual(result, { status: 'skipped', message: 'Removal cancelled.' });
  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'old-tiny-pm');
  assert.equal(await readFile(path.join(target, 'tiny-workers', 'SKILL.md'), 'utf8'), 'old-tiny-workers');
});
